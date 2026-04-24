import z from "zod";
import { PickupLocationStatus } from "../../../../generated/prisma/enums";

const createPickupLocationZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    addressLine: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    district: z.string().min(1, "District is required"),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    openingHours: z.string().optional(),
    status: z
        .enum([PickupLocationStatus.ACTIVE, PickupLocationStatus.INACTIVE])
        .optional(),
    isDefault: z.boolean().optional(),
});

const updatePickupLocationZodSchema = createPickupLocationZodSchema.partial();

export const FulfillmentValidation = {
    createPickupLocationZodSchema,
    updatePickupLocationZodSchema,
};
