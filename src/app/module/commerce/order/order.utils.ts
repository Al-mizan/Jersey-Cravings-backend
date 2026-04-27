import { randomUUID } from "node:crypto";
import { PrismaClient } from "../../../../generated/prisma/client";
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

export const releaseInventory = async (
    orderId: string,
    txClient?: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
    >,
) => {
    const db = txClient || prisma;

    const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
    }

    for (const item of order.items) {
        await db.productVariant.update({
            where: { id: item.variantId },
            data: {
                reservedQty: { decrement: item.qty },
                stockQty: { increment: item.qty },
            },
        });
    }
};

export const markForManualReview = async (
    orderId: string,
    txClient?: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
    >,
) => {
    const db = txClient || prisma;

    await db.order.update({
        where: { id: orderId },
        data: { needsManualReview: true },
    });
};

export const isValidTransition = (from: OrderStatus, to: OrderStatus) => {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING_PAYMENT]: [
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.CANCELLED,
            OrderStatus.EXPIRED,
        ],
        [OrderStatus.PAID]: [
            OrderStatus.PROCESSING,
            OrderStatus.REFUNDED,
            OrderStatus.CANCELLED,
        ],
        [OrderStatus.PROCESSING]: [
            OrderStatus.SHIPPED,
            OrderStatus.CANCELLED,
            OrderStatus.REFUNDED,
        ],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.REFUNDED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.REFUNDED]: [],
        [OrderStatus.EXPIRED]: [],
    };

    return allowed[from].includes(to);
};

type ProcessingTransitionOrder = {
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
};

export const canMoveToProcessing = (order: ProcessingTransitionOrder) => {
    // Guard the special path PENDING_PAYMENT -> PROCESSING.
    // COD can be processed before collection, while online methods require
    // payment to be settled first.
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
        return true;
    }

    if (order.paymentMethod === PaymentMethod.COD) {
        return true;
    }

    return order.paymentStatus === PaymentStatus.SUCCEEDED;
};


export const BANGLADESH_DIVISIONS = new Set([
    "dhaka",
    "chattogram",
    "khulna",
    "rajshahi",
    "barishal",
    "sylhet",
    "rangpur",
    "mymensingh",
]);


export const generateOrderNumber = () => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
    return `JC-${y}${m}${d}-${suffix}`;
};

export const getDiscountAmount = (
    coupon: {
        discountType: "PERCENT" | "FLAT";
        value: number;
        maxDiscountAmount: number | null;
    },
    subtotal: number,
) => {
    if (coupon.discountType === "FLAT") {
        return Math.min(subtotal, coupon.value);
    }

    const rawDiscount = Math.floor((subtotal * coupon.value) / 100);
    if (!coupon.maxDiscountAmount) {
        return rawDiscount;
    }

    return Math.min(rawDiscount, coupon.maxDiscountAmount);
};