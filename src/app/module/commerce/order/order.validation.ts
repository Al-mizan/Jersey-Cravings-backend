import z from "zod";
import {
    FulfillmentMethod,
    GiftCardCategory,
    OrderStatus,
} from "../../../../generated/prisma/enums";

const createOrderZodSchema = z.object({
    fulfillmentMethod: z
        .enum([FulfillmentMethod.DELIVERY, FulfillmentMethod.PICKUP])
        .optional(),
    pickupLocationId: z.string().optional(),
    shippingAddressId: z.string().optional(),
    billingAddressSnapshot: z.record(z.string(), z.unknown()).optional(),
    notes: z.string().max(500).optional(),
    couponCode: z.string().optional(),
    redeemPoints: z.number().int().nonnegative().optional(),
    referralCode: z.string().optional(),
    giftAddon: z
        .object({
            category: z.enum([
                GiftCardCategory.FRIEND,
                GiftCardCategory.PARTNER,
                GiftCardCategory.FAMILY,
            ]),
            customMessage: z.string().max(200).optional(),
        })
        .optional(),
});

const updateOrderStatusZodSchema = z.object({
    status: z.enum([
        OrderStatus.PENDING_PAYMENT,
        OrderStatus.PAID,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
        OrderStatus.EXPIRED,
    ]),
});

export const OrderValidation = {
    createOrderZodSchema,
    updateOrderStatusZodSchema,
};
