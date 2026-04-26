import z from "zod";
import { DiscountType } from "../../../../generated/prisma/enums";

const createCouponZodSchema = z.object({
    code: z
        .string()
        .min(2, "Coupon code is required")
        .transform((v) => v.toUpperCase()),
    discountType: z.enum([DiscountType.PERCENT, DiscountType.FLAT]),
    value: z.number().int().positive(),
    maxDiscountAmount: z.number().int().positive().optional(),
    minOrderAmount: z.number().int().nonnegative().optional(),
    usageLimit: z.number().int().positive().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
});

const updateCouponZodSchema = createCouponZodSchema.partial();

const validateCouponZodSchema = z.object({
    code: z.string().min(2, "Coupon code is required"),
    orderAmount: z.number().int().nonnegative(),
});

export const CouponValidation = {
    createCouponZodSchema,
    updateCouponZodSchema,
    validateCouponZodSchema,
};
