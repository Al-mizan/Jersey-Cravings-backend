import { GiftCardCategory } from "../../../../generated/prisma/enums";

export interface IUpsertOrderGiftAddonPayload {
    category: GiftCardCategory;
    customMessage?: string;
}
