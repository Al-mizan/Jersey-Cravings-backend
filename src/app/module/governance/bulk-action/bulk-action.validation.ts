import z from "zod";

const prismaIdSchema = z.union(
    [
        z.string().trim().uuid(),
        z.string().trim().cuid(),
        z.string().trim().cuid2(),
    ],
    {
        error: "ID must be a valid uuid/cuid/cuid2",
    },
);

export const bulkPublishZodSchema = z.object({
    productIds: z.array(prismaIdSchema).min(1).max(100),
});

export const bulkArchiveZodSchema = z.object({
    productIds: z.array(prismaIdSchema).min(1).max(100),
});

export const bulkCategoryToggleZodSchema = z.object({
    categoryIds: z.array(prismaIdSchema).min(1).max(100),
    isActive: z.boolean(),
});

export const bulkCouponToggleZodSchema = z.object({
    couponIds: z.array(prismaIdSchema).min(1).max(100),
    isActive: z.boolean(),
});
