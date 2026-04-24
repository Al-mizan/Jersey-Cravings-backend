import z from "zod";

const overrideReferralStatusZodSchema = z.object({
    referralEventId: z.string().min(1, "Referral event ID is required"),
    status: z.enum(["PENDING", "REWARDED", "REJECTED"]),
});

export const CustomerReferralValidation = {
    overrideReferralStatusZodSchema,
};
