import cron from "node-cron";
import { prisma } from "../../../lib/prisma";
import { OrderStatus, PaymentStatus } from "../../../../generated/prisma/enums";
import { releaseInventory, markForManualReview } from "../order/order.utils";

const handleAutoExpiry = async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const expiredOrders = await prisma.order.findMany({
            where: {
                paymentStatus: {
                    in: [
                        PaymentStatus.UNPAID,
                        PaymentStatus.REQUIRES_PAYMENT_METHOD,
                        PaymentStatus.REQUIRES_ACTION,
                    ],
                },
                status: {
                    notIn: [
                        OrderStatus.CANCELLED,
                        OrderStatus.DELIVERED,
                        OrderStatus.SHIPPED,
                        OrderStatus.EXPIRED,
                    ],
                },
                createdAt: {
                    lt: oneHourAgo,
                },
            },
        });

        if (expiredOrders.length === 0) return;

        for (const order of expiredOrders) {
            await prisma.$transaction(async (tx) => {
                // Update Order and Payment statuses
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: OrderStatus.CANCELLED,
                        paymentStatus: PaymentStatus.CANCELED,
                        cancelledAt: new Date(),
                    },
                });

                await tx.payment.update({
                    where: { orderId: order.id },
                    data: {
                        status: PaymentStatus.CANCELED,
                    },
                });

                // Release inventory
                await releaseInventory(order.id, tx);
                console.log(
                    `Auto-expired Order ${order.orderNumber} (ID: ${order.id}) and released inventory.`,
                );
            });
        }
    } catch (error) {
        console.error("Error in handleAutoExpiry cron job:", error);
    }
};

const handleStuckProcessing = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stuckOrders = await prisma.order.findMany({
            where: {
                status: OrderStatus.PROCESSING,
                needsManualReview: false,
                updatedAt: {
                    lt: twentyFourHoursAgo,
                },
            },
        });

        if (stuckOrders.length === 0) return;

        for (const order of stuckOrders) {
            await markForManualReview(order.id);
            console.log(
                `Marked Order ${order.orderNumber} (ID: ${order.id}) for manual review (stuck in PROCESSING).`,
            );
        }
    } catch (error) {
        console.error("Error in handleStuckProcessing cron job:", error);
    }
};

const handleArchiving = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

        // 1. Archive FAILED orders older than 30 days
        const failedOrders = await prisma.order.findMany({
            where: {
                paymentStatus: PaymentStatus.FAILED,
                isActive: true,
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        for (const order of failedOrders) {
            await prisma.order.update({
                where: { id: order.id },
                data: { isActive: false },
            });
            console.log(
                `Archived FAILED Order ${order.orderNumber} (ID: ${order.id}).`,
            );
        }

        // 2. Archive CANCELED orders older than 1 year
        const canceledOrders = await prisma.order.findMany({
            where: {
                status: OrderStatus.CANCELLED,
                isActive: true,
                createdAt: {
                    lt: oneYearAgo,
                },
            },
        });

        for (const order of canceledOrders) {
            await prisma.order.update({
                where: { id: order.id },
                data: { isActive: false },
            });
            console.log(
                `Archived CANCELED Order ${order.orderNumber} (ID: ${order.id}).`,
            );
        }
    } catch (error) {
        console.error("Error in handleArchiving cron job:", error);
    }
};

export const initPaymentCron = () => {
    // Run every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
        console.log("Running Order PaymentStatus transition cron job...");
        await handleAutoExpiry();
        await handleStuckProcessing();
        await handleArchiving();
    });
    console.log("Order PaymentStatus transition cron job initialized.");
};
