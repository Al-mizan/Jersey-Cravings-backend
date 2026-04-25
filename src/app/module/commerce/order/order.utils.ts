import { PrismaClient } from "../../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";

export const releaseInventory = async (
    orderId: string,
    txClient?: Omit<
        PrismaClient,
        "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
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
        "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
) => {
    const db = txClient || prisma;

    await db.order.update({
        where: { id: orderId },
        data: { needsManualReview: true },
    });
};
