import z from "zod";

const pointTransactionQueryZodSchema = z.object({
    type: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

const updateLoyaltySettingZodSchema = z.object({
    earnRateBps: z.number().int().min(0).max(10000).optional(),
    minPurchasedQtyToRedeem: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

export const CustomerLoyaltyValidation = {
    pointTransactionQueryZodSchema,
    updateLoyaltySettingZodSchema,
};
