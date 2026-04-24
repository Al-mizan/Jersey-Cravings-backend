import z from "zod";
import { GiftCardCategory } from "../../../../generated/prisma/enums";

const upsertOrderGiftAddonZodSchema = z.object({
    category: z.enum([
        GiftCardCategory.FRIEND,
        GiftCardCategory.PARTNER,
        GiftCardCategory.FAMILY,
    ]),
    customMessage: z.string().max(200).optional(),
});

export const GiftAddonValidation = {
    upsertOrderGiftAddonZodSchema,
};
