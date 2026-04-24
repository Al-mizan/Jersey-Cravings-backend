import z from "zod";

export const bulkPublishZodSchema = z.object({
    productIds: z.array(z.string().uuid()).min(1).max(100),
});

export const bulkArchiveZodSchema = z.object({
    productIds: z.array(z.string().uuid()).min(1).max(100),
});

export const bulkCategoryToggleZodSchema = z.object({
    categoryIds: z.array(z.string().uuid()).min(1).max(100),
    isActive: z.boolean(),
});

export const bulkCouponToggleZodSchema = z.object({
    couponIds: z.array(z.string().uuid()).min(1).max(100),
    isActive: z.boolean(),
});
