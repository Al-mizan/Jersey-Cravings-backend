import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { IAddToCartPayload, IUpdateCartItemPayload } from "./cart.interface";
import { logAudit } from "../../../shared/logAudit";

const getMyCart = async (user: IRequestUser) => {
    const cart = await prisma.cart.upsert({
        where: { userId: user.userId },
        update: {},
        create: { userId: user.userId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    status: true,
                                    isDeleted: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    const subtotalAmount = cart.items.reduce(
        (sum, item) => sum + item.qty * item.variant.priceAmount,
        0,
    );

    return {
        ...cart,
        summary: {
            itemCount: cart.items.length,
            subtotalAmount,
        },
    };
};

const addToCart = async (
    user: IRequestUser,
    payload: IAddToCartPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    return await prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.findUnique({
            where: { id: payload.variantId },
            include: { product: true },
        });

        if (!variant || !variant.isActive || variant.product.isDeleted) {
            throw new AppError(status.NOT_FOUND, "Variant not found");
        }

        if (variant.stockQty < payload.qty) {
            throw new AppError(status.BAD_REQUEST, "Insufficient stock");
        }

        const cart = await tx.cart.upsert({
            where: { userId: user.userId },
            update: {},
            create: { userId: user.userId },
        });

        const existingItem = await tx.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId: payload.variantId,
                },
            },
        });

        const nextQty = (existingItem?.qty || 0) + payload.qty;
        if (nextQty > variant.stockQty) {
            throw new AppError(
                status.BAD_REQUEST,
                "Requested quantity exceeds stock",
            );
        }

        const result = await tx.cartItem.upsert({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId: payload.variantId,
                },
            },
            update: { qty: nextQty },
            create: {
                cartId: cart.id,
                variantId: payload.variantId,
                qty: payload.qty,
            },
        });

        await logAudit(
            {
                actorRole: user.role,
                actorUserId: user.userId,
                action: "ADD_ITEM",
                entityType: "Cart",
                entityId: cart.id,
                beforeState: existingItem || {},
                afterState: result,
                ipAddress,
                userAgent,
            },
            tx,
        );

        return result;
    });
};

const updateCartItem = async (
    user: IRequestUser,
    cartItemId: string,
    payload: IUpdateCartItemPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
            cart: true,
            variant: true,
        },
    });

    if (!cartItem || cartItem.cart.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Cart item not found");
    }

    if (cartItem.variant.stockQty < payload.qty) {
        throw new AppError(status.BAD_REQUEST, "Insufficient stock");
    }
    return await prisma.$transaction(async (tx) => {
        const updated = await tx.cartItem.update({
            where: { id: cartItemId },
            data: { qty: payload.qty },
        });

        await logAudit(
            {
                actorRole: user.role,
                actorUserId: user.userId,
                action: "UPDATE_ITEM",
                entityType: "CartItem",
                entityId: cartItem.id,
                beforeState: cartItem,
                afterState: updated,
                ipAddress,
                userAgent,
            },
            tx,
        );

        return updated;
    });
};

const removeCartItem = async (
    user: IRequestUser,
    cartItemId: string,
    ipAddress?: string,
    userAgent?: string,
) => {
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Cart item not found");
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "REMOVE_ITEM",
        entityType: "CartItem",
        entityId: cartItem.id,
        beforeState: cartItem,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return { success: true };
};

const clearMyCart = async (
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const cart = await prisma.cart.findUnique({
        where: { userId: user.userId },
    });

    if (!cart) {
        return { success: true };
    }

    const beforeItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CLEAR_CART",
        entityType: "Cart",
        entityId: cart.id,
        beforeState: { items: beforeItems },
        afterState: { items: [] },
        ipAddress,
        userAgent,
    });

    return { success: true };
};

const getCustomerCartForAdmin = async (customerUserId: string) => {
    const cart = await prisma.cart.findUnique({
        where: { userId: customerUserId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                },
                            },
                        },
                    },
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });

    if (!cart) {
        throw new AppError(status.NOT_FOUND, "Cart not found");
    }

    return cart;
};

export const CartService = {
    getMyCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearMyCart,
    getCustomerCartForAdmin,
};
