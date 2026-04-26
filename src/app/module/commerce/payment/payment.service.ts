/* eslint-disable @typescript-eslint/no-unused-vars */
import status from "http-status";
import Stripe from "stripe";
import { Prisma } from "../../../../generated/prisma/client";
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "../../../../generated/prisma/enums";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { sendEmail } from "../../../utils/email";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICollectCodPaymentPayload,
    IInitiatePaymentPayload,
    IPaymentQueryParams,
    IRefundPaymentPayload,
    IWebhookFinalizePaymentPayload,
} from "./payment.interface";
import { generateOrderInvoicePdf } from "./payment.utils";
import { logAudit } from "../../../shared/logAudit";

const initiatePayment = async (
    user: IRequestUser,
    payload: IInitiatePaymentPayload,
) => {
    const order = await prisma.order.findUnique({
        where: { id: payload.orderId },
        include: { payment: true },
    });

    if (!order || order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new AppError(
            status.BAD_REQUEST,
            "Payment can only be initiated for pending orders",
        );
    }

    if (!order.payment) {
        throw new AppError(
            status.NOT_FOUND,
            "Payment record not found for this order",
        );
    }

    if (order.payment.method === PaymentMethod.COD) {
        throw new AppError(
            status.BAD_REQUEST,
            "COD orders do not require Stripe initiation",
        );
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
            status: PaymentStatus.REQUIRES_ACTION,
            paymentGatewayData: {
                paymentIntentStatus: PaymentStatus.REQUIRES_ACTION,
                fakeClientSecret: `pi_${order.payment.transactionId}_secret_${Date.now()}`,
            } as Prisma.InputJsonValue,
        },
    });

    return {
        paymentId: updatedPayment.id,
        transactionId: updatedPayment.transactionId,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        clientSecret: (
            updatedPayment.paymentGatewayData as Record<string, unknown>
        )?.fakeClientSecret,
    };
};

const getMyPayments = async (
    user: IRequestUser,
    queryParams: IPaymentQueryParams,
) => {
    const queryBuilder = new QueryBuilder(prisma.payment, queryParams, {
        filterableFields: ["status", "method"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .where({ order: { userId: user.userId } })
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            totalAmount: true,
                            status: true,
                            paymentStatus: true,
                        },
                    },
                },
            }),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const getPaymentByOrderForCustomer = async (
    user: IRequestUser,
    orderId: string,
) => {
    const payment = await prisma.payment.findUnique({
        where: { orderId },
        include: {
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    userId: true,
                    totalAmount: true,
                    status: true,
                    paymentStatus: true,
                },
            },
        },
    });

    if (!payment || payment.order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    return payment;
};

const getAllPaymentsForAdmin = async (queryParams: IPaymentQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.payment, queryParams, {
        filterableFields: ["status", "method"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            userId: true,
                            totalAmount: true,
                            status: true,
                            paymentStatus: true,
                        },
                    },
                },
            }),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const refundPaymentByAdmin = async (
    paymentId: string,
    payload: IRefundPaymentPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
    });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
        throw new AppError(
            status.BAD_REQUEST,
            "Only succeeded payments can be refunded",
        );
    }

    const [updatedPayment, updatedOrder] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.REFUNDED,
                paymentGatewayData: {
                    ...(payment.paymentGatewayData as Record<string, unknown>),
                    refundReason: payload.reason || "Admin initiated",
                    refundedAt: new Date().toISOString(),
                } as Prisma.InputJsonValue,
            },
        }),
        prisma.order.update({
            where: { id: payment.orderId },
            data: {
                status: OrderStatus.REFUNDED,
                paymentStatus: PaymentStatus.REFUNDED,
            },
        }),
    ]);

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "REFUND",
        entityType: "Payment",
        entityId: payment.id,
        beforeState: payment,
        afterState: { payment: updatedPayment, order: updatedOrder },
        ipAddress,
        userAgent,
    });

    return { payment: updatedPayment, order: updatedOrder };
};

const collectCodPaymentByAdmin = async (
    paymentId: string,
    payload: ICollectCodPaymentPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
    });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    if (payment.method !== PaymentMethod.COD) {
        throw new AppError(
            status.BAD_REQUEST,
            "Only COD payments can be collected manually",
        );
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
        throw new AppError(status.BAD_REQUEST, "COD payment already collected");
    }

    const [updatedPayment, updatedOrder] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.SUCCEEDED,
                collectedAt: new Date(),
                collectedByAdminId: actor.userId,
                paymentGatewayData: {
                    ...(payment.paymentGatewayData as Record<string, unknown>),
                    codCollectionNote: payload.note || null,
                    collectedAt: new Date().toISOString(),
                } as Prisma.InputJsonValue,
            },
        }),
        prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: PaymentStatus.SUCCEEDED,
                paidAt: payment.order.paidAt || new Date(),
                status:
                    payment.order.status === OrderStatus.PENDING_PAYMENT
                        ? OrderStatus.PAID
                        : payment.order.status,
            },
        }),
    ]);

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "COLLECT_COD",
        entityType: "Payment",
        entityId: payment.id,
        beforeState: payment,
        afterState: { payment: updatedPayment, order: updatedOrder },
        ipAddress,
        userAgent,
    });

    return { payment: updatedPayment, order: updatedOrder };
};

const finalizePaymentFromWebhook = async (
    payload: IWebhookFinalizePaymentPayload,
) => {
    const payment = await prisma.payment.findUnique({
        where: { transactionId: payload.transactionId },
        include: { order: true },
    });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment transaction not found");
    }

    if (payment.method !== PaymentMethod.STRIPE) {
        throw new AppError(
            status.BAD_REQUEST,
            "Webhook finalize is only supported for Stripe payments",
        );
    }

    const beforeState = { ...payment };

    const mappedOrderStatus =
        payload.status === PaymentStatus.SUCCEEDED
            ? OrderStatus.PAID
            : payload.status === PaymentStatus.REFUNDED
              ? OrderStatus.REFUNDED
              : payload.status === PaymentStatus.CANCELED
                ? OrderStatus.CANCELLED
                : OrderStatus.PENDING_PAYMENT;

    const [updatedPayment, updatedOrder] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                stripeEventId: payload.stripeEventId,
                status: payload.status,
                paymentGatewayData:
                    payload.paymentGatewayData as Prisma.InputJsonValue,
            },
        }),
        prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: payload.status,
                status:
                    payload.status === PaymentStatus.FAILED
                        ? payment.order.status
                        : mappedOrderStatus,
                paidAt:
                    payload.status === PaymentStatus.SUCCEEDED &&
                    !payment.order.paidAt
                        ? new Date()
                        : payment.order.paidAt,
            },
        }),
    ]);

    await prisma.auditLog.create({
        data: {
            actorUserId: payment.order.userId,
            actorRole: payment.order.userId ? "CUSTOMER" : "SUPER_ADMIN",
            action: "WEBHOOK_PAYMENT_FINALIZE",
            entityType: "Payment",
            entityId: payment.id,
            beforeState: beforeState as Prisma.InputJsonValue,
            afterState: {
                payment: updatedPayment,
                order: updatedOrder,
            } as Prisma.InputJsonValue,
        },
    });

    return { payment: updatedPayment, order: updatedOrder };
};

const handleStripeWebhookEvent = async (
    signature: string,
    rawBody: unknown,
) => {
    const webhookSecret = envVars.STRIPE.WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        throw new AppError(
            status.BAD_REQUEST,
            "Missing Stripe signature or webhook secret",
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody as string | Buffer,
            signature,
            webhookSecret,
        );
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        throw new AppError(
            status.BAD_REQUEST,
            `Webhook signature verification failed: ${message}`,
        );
    }

    // Check for duplicate events
    const existingEvent = await prisma.payment.findFirst({
        where: { stripeEventId: event.id },
    });

    if (existingEvent) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (!orderId) {
                console.error("⚠️ Missing orderId in Stripe session metadata");
                return { message: "Missing orderId in metadata" };
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                    user: true,
                    payment: true,
                    coupons: {
                        include: {
                            coupon: true,
                        },
                    },
                },
            });

            if (!order) {
                console.error(`⚠️ Order ${orderId} not found`);
                return { message: "Order not found" };
            }

            const result = await prisma.$transaction(async (tx) => {
                let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
                let orderStatus = order.status;

                if (session.payment_status === "paid") {
                    paymentStatus = PaymentStatus.SUCCEEDED;
                    orderStatus = OrderStatus.PAID;
                }

                const updatedPayment = await tx.payment.update({
                    where: { id: order.payment!.id },
                    data: {
                        status: paymentStatus,
                        paymentGatewayData: JSON.parse(
                            JSON.stringify(session),
                        ) as Prisma.InputJsonValue,
                        stripeEventId: event.id,
                    },
                });

                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: orderStatus,
                        paymentStatus,
                        paidAt:
                            session.payment_status === "paid"
                                ? new Date()
                                : null,
                    },
                });

                return { updatedPayment, updatedOrder };
            });

            // Keep non-DB work outside the transaction to reduce lock duration.
            if (session.payment_status === "paid") {
                try {
                    await generateOrderInvoicePdf({
                        invoiceId: result.updatedPayment.id,
                        orderNumber: order.orderNumber,
                        customerName: order.user.email,
                        customerEmail: order.user.email,
                        orderDate: order.createdAt.toISOString(),
                        items: order.items.map((item) => ({
                            productTitle:
                                item.productTitleSnapshot || item.product.title,
                            qty: item.qty,
                            unitPrice: item.unitPriceAmount,
                            lineTotal: item.lineTotalAmount,
                        })),
                        subtotal: order.subtotalAmount,
                        discount: order.discountAmount,
                        shipping: order.shippingAmount,
                        giftAddon: order.giftAddonAmount,
                        totalAmount: order.totalAmount,
                        transactionId: result.updatedPayment.transactionId,
                        paymentDate: new Date().toISOString(),
                    });

                    console.log(
                        `✅ Invoice PDF generated for order ${orderId}`,
                    );
                } catch (pdfError) {
                    console.error("❌ Error generating invoice PDF:", pdfError);
                }
            }

            // Send confirmation email
            if (session.payment_status === "paid") {
                try {
                    await sendEmail({
                        to: order.user.email,
                        subject: `Order Confirmation - ${order.orderNumber}`,
                        templateName: "invoice",
                        templateData: {
                            customerName: order.user.email,
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            totalAmount: order.totalAmount,
                            orderDate: new Date(
                                order.createdAt,
                            ).toLocaleDateString(),
                        },
                    });

                    console.log(
                        `✅ Order confirmation email sent to ${order.user.email}`,
                    );
                } catch (emailError) {
                    console.error("❌ Error sending order email:", emailError);
                }
            }

            console.log(`✅ Stripe checkout completed for order ${orderId}`);
            return result;
        }

        case "charge.failed": {
            const charge = event.data.object as Stripe.Charge;
            console.log(`❌ Charge failed: ${charge.id}`);
            break;
        }

        default:
            console.log(`⚠️ Unhandled Stripe event type: ${event.type}`);
    }

    return { message: `Webhook event ${event.id} processed successfully` };
};

export const PaymentService = {
    initiatePayment,
    getMyPayments,
    getPaymentByOrderForCustomer,
    getAllPaymentsForAdmin,
    refundPaymentByAdmin,
    collectCodPaymentByAdmin,
    finalizePaymentFromWebhook,
    handleStripeWebhookEvent,
};
