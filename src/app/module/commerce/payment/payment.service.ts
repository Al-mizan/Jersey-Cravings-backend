import status from "http-status";
import { Prisma } from "../../../../generated/prisma/client";
import { OrderStatus, PaymentStatus } from "../../../../generated/prisma/enums";
import AppError from "../../../errorHelpers/AppError";
import { IAuditLog } from "../../../interface/logging.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    IInitiatePaymentPayload,
    IPaymentQueryParams,
    IRefundPaymentPayload,
    IWebhookFinalizePaymentPayload,
} from "./payment.interface";

const logAudit = async ({
    actorRole,
    actorUserId,
    action,
    entityType,
    entityId,
    beforeState,
    afterState,
    ipAddress,
    userAgent,
}: IAuditLog) => {
    await prisma.auditLog.create({
        data: {
            actorUserId,
            actorRole,
            action,
            entityType,
            entityId,
            beforeState: beforeState as Prisma.InputJsonValue,
            afterState: afterState as Prisma.InputJsonValue,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
        },
    });
};

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
        filterableFields: ["status"],
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
        filterableFields: ["status"],
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
            ipAddress: "system",
            userAgent: "webhook",
        },
    });

    return { payment: updatedPayment, order: updatedOrder };
};

export const PaymentService = {
    initiatePayment,
    getMyPayments,
    getPaymentByOrderForCustomer,
    getAllPaymentsForAdmin,
    refundPaymentByAdmin,
    finalizePaymentFromWebhook,
};
