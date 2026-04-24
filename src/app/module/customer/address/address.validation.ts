import z from "zod";

const createAddressZodSchema = z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    phone: z.string().min(6, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    area: z.string().min(1, "Area is required"),
    district: z.string().min(1, "District is required"),
    division: z.string().min(1, "Division is required"),
    isDefault: z.boolean().optional(),
});

const updateAddressZodSchema = z.object({
    recipientName: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    address: z.string().min(1).optional(),
    area: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    division: z.string().min(1).optional(),
    isDefault: z.boolean().optional(),
});

export const AddressValidation = {
    createAddressZodSchema,
    updateAddressZodSchema,
};
