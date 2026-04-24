import status from "http-status";
import { Prisma } from "../../../../generated/prisma/client";
import { OrderStatus } from "../../../../generated/prisma/enums";
import AppError from "../../../errorHelpers/AppError";
import { IAuditLog } from "../../../interface/logging.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { IUpsertOrderGiftAddonPayload } from "./gift-addon.interface";

const BASE_CARD_CHARGE = 30;
const CUSTOM_MESSAGE_CHARGE = 20;

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

const getMyOrderGiftAddon = async (user: IRequestUser, orderId: string) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return await prisma.orderGiftAddon.findUnique({ where: { orderId } });
};

const upsertOrderGiftAddon = async (
    user: IRequestUser,
    orderId: string,
    payload: IUpsertOrderGiftAddonPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { giftAddon: true },
    });

    if (!order || order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new AppError(
            status.BAD_REQUEST,
            "Gift add-on can only be modified before payment",
        );
    }

    const customMessageCharge = payload.customMessage
        ? CUSTOM_MESSAGE_CHARGE
        : 0;
    const totalChargeAmount = BASE_CARD_CHARGE + customMessageCharge;

    const result = await prisma.$transaction(async (tx) => {
        const addon = await tx.orderGiftAddon.upsert({
            where: { orderId },
            update: {
                category: payload.category,
                customMessage: payload.customMessage,
                cardChargeAmount: BASE_CARD_CHARGE,
                customMessageCharge,
                totalChargeAmount,
            },
            create: {
                orderId,
                category: payload.category,
                customMessage: payload.customMessage,
                cardChargeAmount: BASE_CARD_CHARGE,
                customMessageCharge,
                totalChargeAmount,
            },
        });

        await tx.order.update({
            where: { id: orderId },
            data: {
                giftAddonAmount: totalChargeAmount,
                totalAmount: Math.max(
                    0,
                    order.totalAmount -
                        order.giftAddonAmount +
                        totalChargeAmount,
                ),
            },
        });

        return addon;
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: order.giftAddon ? "UPDATE" : "CREATE",
        entityType: "OrderGiftAddon",
        entityId: result.id,
        beforeState: order.giftAddon || {},
        afterState: result,
        ipAddress,
        userAgent,
    });

    return result;
};

const removeOrderGiftAddon = async (
    user: IRequestUser,
    orderId: string,
    ipAddress?: string,
    userAgent?: string,
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { giftAddon: true },
    });

    if (!order || order.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (!order.giftAddon) {
        throw new AppError(
            status.NOT_FOUND,
            "Gift add-on not found for this order",
        );
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new AppError(
            status.BAD_REQUEST,
            "Gift add-on can only be removed before payment",
        );
    }

    await prisma.$transaction([
        prisma.orderGiftAddon.delete({ where: { orderId } }),
        prisma.order.update({
            where: { id: orderId },
            data: {
                giftAddonAmount: 0,
                totalAmount: Math.max(
                    0,
                    order.totalAmount - order.giftAddon.totalChargeAmount,
                ),
            },
        }),
    ]);

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "DELETE",
        entityType: "OrderGiftAddon",
        entityId: order.giftAddon.id,
        beforeState: order.giftAddon,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return { success: true };
};

const getGiftAddonByOrderForAdmin = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            giftAddon: true,
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return order;
};

export const GiftAddonService = {
    getMyOrderGiftAddon,
    upsertOrderGiftAddon,
    removeOrderGiftAddon,
    getGiftAddonByOrderForAdmin,
};
