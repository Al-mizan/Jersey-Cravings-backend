import z from "zod";
import {
    FulfillmentMethod,
    GiftCardCategory,
    OrderStatus,
    PaymentMethod,
} from "../../../../generated/prisma/enums";

const createOrderZodSchema = z
    .object({
        fulfillmentMethod: z
            .enum([FulfillmentMethod.DELIVERY, FulfillmentMethod.PICKUP])
            .optional(),
        paymentMethod: z
            .enum([PaymentMethod.STRIPE, PaymentMethod.COD])
            .optional(),
        pickupLocationId: z.string().optional(),
        shippingAddressId: z.string().optional(),
        billingAddressSnapshot: z.record(z.string(), z.unknown()).optional(),
        notes: z.string().max(500).optional(),
        couponCode: z.string().optional(),
        redeemPoints: z.number().int().nonnegative().optional(),
        referralCode: z
            .string()
            .trim()
            .min(3, "Referral code must be at least 3 characters")
            .max(32, "Referral code is too long")
            .transform((value) => value.toUpperCase())
            .optional(),
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
    })
    .superRefine((value, ctx) => {
        if (
            value.fulfillmentMethod === FulfillmentMethod.PICKUP &&
            !value.pickupLocationId
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["pickupLocationId"],
                message: "Pickup location is required for pickup orders",
            });
        }

        if (
            value.paymentMethod === PaymentMethod.COD &&
            value.fulfillmentMethod !== FulfillmentMethod.PICKUP
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["paymentMethod"],
                message: "COD is only available for pickup orders",
            });
        }
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
