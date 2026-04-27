import { randomUUID } from "node:crypto";
import status from "http-status";
import { Prisma } from "../../../../generated/prisma/client";
import {
    FulfillmentMethod,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    PointTransactionType,
    ProductStatus,
    ReferralRewardStatus,
} from "../../../../generated/prisma/enums";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreateOrderPayload,
    IOrderQueryParams,
    IUpdateOrderStatusPayload,
} from "./order.interface";
import { logAudit } from "../../../shared/logAudit";
import {
    BANGLADESH_DIVISIONS,
    canMoveToProcessing,
    generateOrderNumber,
    getDiscountAmount,
    isValidTransition,
} from "./order.utils";

const SHIPPING_CHARGE_DHAKA = 80;
const SHIPPING_CHARGE_OUTSIDE_DHAKA = 120;
const GIFT_BASE_CHARGE = 30;
const GIFT_CUSTOM_MESSAGE_CHARGE = 20;

const normalizeText = (value: string) => value.trim().toLowerCase();

const createOrder = async (
    user: IRequestUser,
    payload: ICreateOrderPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const fulfillmentMethod =
        payload.fulfillmentMethod || FulfillmentMethod.DELIVERY;
    const paymentMethod = payload.paymentMethod || PaymentMethod.STRIPE;
    const normalizedReferralCode = payload.referralCode?.trim().toUpperCase();

    if (
        paymentMethod === PaymentMethod.COD &&
        fulfillmentMethod !== FulfillmentMethod.PICKUP
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "COD is only available for pickup orders",
        );
    }

    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });

    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer profile not found");
    }

    const cart = await prisma.cart.findUnique({
        where: { userId: user.userId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },
    });

    if (!cart || cart.items.length === 0) {
        throw new AppError(status.BAD_REQUEST, "Cart is empty");
    }

    const unavailableItems = cart.items
        .map((item) => {
            if (!item.variant.isActive) {
                return {
                    sku: item.variant.sku,
                    reason: "variant_inactive",
                };
            }

            if (item.variant.product.isDeleted) {
                return {
                    sku: item.variant.sku,
                    reason: "product_deleted",
                };
            }

            if (item.variant.product.status !== ProductStatus.ACTIVE) {
                return {
                    sku: item.variant.sku,
                    reason: `product_status_${item.variant.product.status.toLowerCase()}`,
                };
            }

            return null;
        })
        .filter(
            (
                item,
            ): item is {
                sku: string;
                reason: string;
            } => item !== null,
        );

    if (unavailableItems.length > 0) {
        const details = unavailableItems
            .map((item) => `${item.sku}(${item.reason})`)
            .join(", ");

        throw new AppError(
            status.BAD_REQUEST,
            `Cart contains unavailable items: ${details}`,
        );
    }

    for (const item of cart.items) {
        if (item.variant.stockQty < item.qty) {
            throw new AppError(
                status.BAD_REQUEST,
                `Insufficient stock for ${item.variant.sku}`,
            );
        }
    }

    const subtotalAmount = cart.items.reduce(
        (sum, item) => sum + item.qty * item.variant.priceAmount,
        0,
    );

    let discountAmount = 0;
    let couponId: string | null = null;

    if (payload.couponCode) {
        const coupon = await prisma.coupon.findUnique({
            where: { code: payload.couponCode.toUpperCase() },
        });

        if (!coupon || coupon.isDeleted || !coupon.isActive) {
            throw new AppError(status.BAD_REQUEST, "Coupon is invalid");
        }

        const now = new Date();
        if (coupon.startsAt && coupon.startsAt > now) {
            throw new AppError(status.BAD_REQUEST, "Coupon is not active yet");
        }
        if (coupon.endsAt && coupon.endsAt < now) {
            throw new AppError(status.BAD_REQUEST, "Coupon has expired");
        }
        if (
            coupon.usageLimit !== null &&
            coupon.usedCount >= coupon.usageLimit
        ) {
            throw new AppError(
                status.BAD_REQUEST,
                "Coupon usage limit exceeded",
            );
        }
        if (
            coupon.minOrderAmount !== null &&
            subtotalAmount < coupon.minOrderAmount
        ) {
            throw new AppError(
                status.BAD_REQUEST,
                "Order amount does not meet coupon minimum",
            );
        }

        discountAmount = getDiscountAmount(coupon, subtotalAmount);
        couponId = coupon.id;
    }

    const pointsToRedeem = payload.redeemPoints || 0;
    if (pointsToRedeem > customer.points) {
        throw new AppError(
            status.BAD_REQUEST,
            "Insufficient points for redemption",
        );
    }

    if (fulfillmentMethod === FulfillmentMethod.PICKUP) {
        if (!payload.pickupLocationId) {
            throw new AppError(
                status.BAD_REQUEST,
                "Pickup location is required for pickup orders",
            );
        }

        const location = await prisma.pickupLocation.findUnique({
            where: { id: payload.pickupLocationId },
        });

        if (!location || location.status !== "ACTIVE") {
            throw new AppError(
                status.BAD_REQUEST,
                "Pickup location is invalid or inactive",
            );
        }
    }

    let shippingAmount = 0;
    let shippingAddressSnapshot: Record<string, unknown> | null = null;
    if (fulfillmentMethod === FulfillmentMethod.DELIVERY) {
        const selectedAddress = payload.shippingAddressId
            ? await prisma.address.findUnique({
                  where: { id: payload.shippingAddressId },
              })
            : await prisma.address.findFirst({
                  where: { userId: user.userId, isDefault: true },
              });

        if (!selectedAddress || selectedAddress.userId !== user.userId) {
            throw new AppError(
                status.BAD_REQUEST,
                "A valid shipping address is required",
            );
        }

        const normalizedDivision = normalizeText(selectedAddress.division);
        if (!BANGLADESH_DIVISIONS.has(normalizedDivision)) {
            throw new AppError(
                status.BAD_REQUEST,
                "Delivery is only available within Bangladesh",
            );
        }

        const normalizedDistrict = normalizeText(selectedAddress.district);
        shippingAmount =
            normalizedDistrict === "dhaka"
                ? SHIPPING_CHARGE_DHAKA
                : SHIPPING_CHARGE_OUTSIDE_DHAKA;

        shippingAddressSnapshot = {
            recipientName: selectedAddress.recipientName,
            phone: selectedAddress.phone,
            address: selectedAddress.address,
            area: selectedAddress.area,
            district: selectedAddress.district,
            division: selectedAddress.division,
        };
    }

    const giftAddonAmount = payload.giftAddon
        ? GIFT_BASE_CHARGE +
          (payload.giftAddon.customMessage ? GIFT_CUSTOM_MESSAGE_CHARGE : 0)
        : 0;

    const totalAmount = Math.max(
        0,
        subtotalAmount -
            discountAmount -
            pointsToRedeem +
            shippingAmount +
            giftAddonAmount,
    );

    const billingAddressSnapshot = payload.billingAddressSnapshot ||
        shippingAddressSnapshot || { customerName: customer.name };

    const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                userId: user.userId,
                status: OrderStatus.PENDING_PAYMENT,
                paymentStatus: PaymentStatus.UNPAID,
                paymentMethod,
                fulfillmentMethod,
                pickupLocationId:
                    fulfillmentMethod === FulfillmentMethod.PICKUP
                        ? payload.pickupLocationId
                        : null,
                subtotalAmount,
                discountAmount,
                shippingAmount,
                giftAddonAmount,
                pointsRedeemed: pointsToRedeem,
                pointsEarned: 0,
                totalAmount,
                shippingAddressSnapshot:
                    shippingAddressSnapshot as Prisma.InputJsonValue,
                billingAddressSnapshot:
                    billingAddressSnapshot as Prisma.InputJsonValue,
                notes: payload.notes,
            },
        });

        await tx.orderItem.createMany({
            data: cart.items.map((item) => ({
                orderId: createdOrder.id,
                productId: item.variant.productId,
                variantId: item.variantId,
                productTitleSnapshot: item.variant.product.title,
                variantSnapshot: {
                    sku: item.variant.sku,
                    size: item.variant.size,
                    fit: item.variant.fit,
                    sleeveType: item.variant.sleeveType,
                } as Prisma.InputJsonValue,
                unitPriceAmount: item.variant.priceAmount,
                qty: item.qty,
                lineTotalAmount: item.qty * item.variant.priceAmount,
            })),
        });

        for (const item of cart.items) {
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stockQty: { decrement: item.qty },
                    reservedQty: { increment: item.qty },
                },
            });
        }

        if (couponId) {
            await tx.orderCoupon.create({
                data: {
                    orderId: createdOrder.id,
                    couponId,
                    appliedAmount: discountAmount,
                },
            });

            await tx.coupon.update({
                where: { id: couponId },
                data: { usedCount: { increment: 1 } },
            });
        }

        if (payload.giftAddon) {
            await tx.orderGiftAddon.create({
                data: {
                    orderId: createdOrder.id,
                    category: payload.giftAddon.category,
                    customMessage: payload.giftAddon.customMessage,
                    cardChargeAmount: GIFT_BASE_CHARGE,
                    customMessageCharge: payload.giftAddon.customMessage
                        ? GIFT_CUSTOM_MESSAGE_CHARGE
                        : 0,
                    totalChargeAmount: giftAddonAmount,
                },
            });
        }

        await tx.payment.create({
            data: {
                orderId: createdOrder.id,
                amount: totalAmount,
                transactionId: randomUUID(),
                method: paymentMethod,
                status: PaymentStatus.UNPAID,
            },
        });

        if (pointsToRedeem > 0) {
            await tx.customer.update({
                where: { id: customer.id },
                data: {
                    points: { decrement: pointsToRedeem },
                    lifetimePointsRedeemed: { increment: pointsToRedeem },
                },
            });

            await tx.pointTransaction.create({
                data: {
                    customerId: customer.id,
                    orderId: createdOrder.id,
                    type: PointTransactionType.REDEEM_ORDER,
                    points: -pointsToRedeem,
                    balanceAfter: customer.points - pointsToRedeem,
                    note: "Points redeemed at checkout",
                },
            });
        }

        if (normalizedReferralCode) {
            const referralCode = await tx.referralCode.findUnique({
                where: { code: normalizedReferralCode },
                include: {
                    ownerCustomer: {
                        select: {
                            id: true,
                            userId: true,
                        },
                    },
                },
            });

            if (referralCode?.ownerCustomer.userId === user.userId) {
                throw new AppError(
                    status.BAD_REQUEST,
                    "You cannot use your own referral code",
                );
            }

            if (
                referralCode &&
                referralCode.isActive &&
                referralCode.ownerCustomer.userId !== user.userId
            ) {
                const rewardPoints = Math.floor((totalAmount * 200) / 10000);
                await tx.referralEvent.create({
                    data: {
                        referralCodeId: referralCode.id,
                        referredCustomerId: customer.id,
                        referredOrderId: createdOrder.id,
                        orderAmount: totalAmount,
                        rewardRateBps: 200,
                        rewardPoints,
                        status: ReferralRewardStatus.PENDING,
                    },
                });
            }
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return await tx.order.findUnique({
            where: { id: createdOrder.id },
            include: {
                items: true,
                coupons: true,
                giftAddon: true,
                payment: true,
                pickupLocation: {
                    select: {
                        id: true,
                        name: true,
                        addressLine: true,
                        city: true,
                        district: true,
                        phone: true,
                        openingHours: true,
                    },
                },
            },
        });
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CREATE",
        entityType: "Order",
        entityId: order!.id,
        beforeState: {},
        afterState: order!,
        ipAddress,
        userAgent,
    });

    return order;
};

const getMyOrders = async (
    user: IRequestUser,
    queryParams: IOrderQueryParams,
) => {
    const queryBuilder = new QueryBuilder(prisma.order, queryParams, {
        searchableFields: ["orderNumber", "payment.transactionId"],
        filterableFields: ["status", "paymentStatus", "fulfillmentMethod"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .where({ userId: user.userId })
            .search()
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    items: true,
                    payment: true,
                    pickupLocation: {
                        select: {
                            id: true,
                            name: true,
                            addressLine: true,
                            city: true,
                            district: true,
                            phone: true,
                            openingHours: true,
                        },
                    },
                    coupons: {
                        include: {
                            coupon: true,
                        },
                    },
                    giftAddon: true,
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

const getMyOrderById = async (user: IRequestUser, orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                    variant: true,
                },
            },
            payment: true,
            pickupLocation: {
                select: {
                    id: true,
                    name: true,
                    addressLine: true,
                    city: true,
                    district: true,
                    phone: true,
                    openingHours: true,
                },
            },
            coupons: {
                include: {
                    coupon: true,
                },
            },
            giftAddon: true,
            referralEvent: true,
        },
    });

    if (!order || order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return order;
};

const cancelMyOrder = async (
    user: IRequestUser,
    orderId: string,
    ipAddress?: string,
    userAgent?: string,
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: true,
            pointTransactions: true,
        },
    });

    if (!order || order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new AppError(
            status.BAD_REQUEST,
            "Only pending payment orders can be cancelled",
        );
    }

    const cancelled = await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stockQty: { increment: item.qty },
                    reservedQty: { decrement: item.qty },
                },
            });
        }

        const redeemTx = order.pointTransactions.find(
            (tx) => tx.type === PointTransactionType.REDEEM_ORDER,
        );

        if (redeemTx) {
            const customer = await tx.customer.findUnique({
                where: { userId: user.userId },
            });
            if (customer) {
                const restorePoints = Math.abs(redeemTx.points);
                await tx.customer.update({
                    where: { id: customer.id },
                    data: {
                        points: { increment: restorePoints },
                        lifetimePointsRedeemed: { decrement: restorePoints },
                    },
                });

                await tx.pointTransaction.create({
                    data: {
                        customerId: customer.id,
                        orderId: order.id,
                        type: PointTransactionType.REVERSAL,
                        points: restorePoints,
                        balanceAfter: customer.points + restorePoints,
                        note: "Points restored after order cancellation",
                    },
                });
            }
        }

        await tx.payment.update({
            where: { orderId: order.id },
            data: {
                status: PaymentStatus.CANCELED,
            },
        });

        return await tx.order.update({
            where: { id: order.id },
            data: {
                status: OrderStatus.CANCELLED,
                paymentStatus: PaymentStatus.CANCELED,
                cancelledAt: new Date(),
            },
        });
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CANCEL",
        entityType: "Order",
        entityId: order.id,
        beforeState: order,
        afterState: cancelled,
        ipAddress,
        userAgent,
    });

    return cancelled;
};

const getAllOrdersForAdmin = async (queryParams: IOrderQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.order, queryParams, {
        searchableFields: ["orderNumber", "user.email"],
        filterableFields: [
            "status",
            "paymentStatus",
            "fulfillmentMethod",
            "userId",
        ],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .search()
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                    payment: true,
                    items: true,
                    pickupLocation: {
                        select: {
                            id: true,
                            name: true,
                            addressLine: true,
                            city: true,
                            district: true,
                            phone: true,
                            openingHours: true,
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

const getOrderByIdForAdmin = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
            items: true,
            payment: true,
            pickupLocation: {
                select: {
                    id: true,
                    name: true,
                    addressLine: true,
                    city: true,
                    district: true,
                    phone: true,
                    openingHours: true,
                },
            },
            coupons: {
                include: {
                    coupon: true,
                },
            },
            giftAddon: true,
            pointTransactions: true,
            referralEvent: true,
        },
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return order;
};

const updateOrderStatusByAdmin = async (
    orderId: string,
    payload: IUpdateOrderStatusPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: true,
            referralEvent: {
                include: {
                    referralCode: true,
                },
            },
        },
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (!isValidTransition(order.status, payload.status)) {
        throw new AppError(
            status.BAD_REQUEST,
            `Invalid order transition from ${order.status} to ${payload.status}`,
        );
    }

    if (
        payload.status === OrderStatus.PROCESSING &&
        !canMoveToProcessing(order)
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "Online-paid orders can move to PROCESSING only after payment succeeds",
        );
    }

    const updated = await prisma.$transaction(async (tx) => {
        const nextPaymentStatus =
            payload.status === OrderStatus.REFUNDED
                ? PaymentStatus.REFUNDED
                : payload.status === OrderStatus.PAID ||
                    payload.status === OrderStatus.SHIPPED ||
                    payload.status === OrderStatus.DELIVERED
                  ? PaymentStatus.SUCCEEDED
                  : order.paymentStatus;

        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
                status: payload.status,
                paymentStatus: nextPaymentStatus,
                paidAt:
                    payload.status === OrderStatus.PAID && !order.paidAt
                        ? new Date()
                        : order.paidAt,
                deliveredAt:
                    payload.status === OrderStatus.DELIVERED
                        ? new Date()
                        : order.deliveredAt,
                cancelledAt:
                    payload.status === OrderStatus.CANCELLED
                        ? new Date()
                        : order.cancelledAt,
            },
        });

        if (payload.status === OrderStatus.DELIVERED) {
            const customer = await tx.customer.findUnique({
                where: { userId: order.userId },
            });
            if (customer) {
                const setting = await tx.loyaltySetting.findFirst({
                    where: { isActive: true },
                    orderBy: { updatedAt: "desc" },
                });

                const earnRateBps = setting?.earnRateBps ?? 200;
                const pointsEarned = Math.floor(
                    ((order.subtotalAmount - order.discountAmount) *
                        earnRateBps) /
                        10000,
                );
                const purchasedQty = order.items.reduce(
                    (sum, item) => sum + item.qty,
                    0,
                );

                if (pointsEarned > 0) {
                    await tx.customer.update({
                        where: { id: customer.id },
                        data: {
                            points: { increment: pointsEarned },
                            lifetimePointsEarned: { increment: pointsEarned },
                            totalPurchasedQty: { increment: purchasedQty },
                        },
                    });

                    await tx.pointTransaction.create({
                        data: {
                            customerId: customer.id,
                            orderId: order.id,
                            type: PointTransactionType.EARN_PURCHASE,
                            points: pointsEarned,
                            balanceAfter: customer.points + pointsEarned,
                            note: "Points earned on delivered order",
                        },
                    });

                    await tx.order.update({
                        where: { id: order.id },
                        data: { pointsEarned },
                    });
                }

                if (
                    order.referralEvent &&
                    order.referralEvent.status ===
                        ReferralRewardStatus.PENDING &&
                    order.referralEvent.referralCode
                ) {
                    const ownerCustomer = await tx.customer.findUnique({
                        where: {
                            id: order.referralEvent.referralCode
                                .ownerCustomerId,
                        },
                    });

                    if (ownerCustomer) {
                        await tx.customer.update({
                            where: { id: ownerCustomer.id },
                            data: {
                                points: {
                                    increment: order.referralEvent.rewardPoints,
                                },
                                lifetimePointsEarned: {
                                    increment: order.referralEvent.rewardPoints,
                                },
                            },
                        });

                        await tx.pointTransaction.create({
                            data: {
                                customerId: ownerCustomer.id,
                                orderId: order.id,
                                type: PointTransactionType.REFERRAL_BONUS,
                                points: order.referralEvent.rewardPoints,
                                balanceAfter:
                                    ownerCustomer.points +
                                    order.referralEvent.rewardPoints,
                                note: "Referral reward credited after order delivery",
                            },
                        });

                        await tx.referralEvent.update({
                            where: { id: order.referralEvent.id },
                            data: {
                                status: ReferralRewardStatus.REWARDED,
                                rewardedAt: new Date(),
                            },
                        });
                    }
                }
            }
        }

        return updatedOrder;
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "CHANGE_STATUS",
        entityType: "Order",
        entityId: order.id,
        beforeState: order,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

export const OrderService = {
    createOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    getAllOrdersForAdmin,
    getOrderByIdForAdmin,
    updateOrderStatusByAdmin,
};
