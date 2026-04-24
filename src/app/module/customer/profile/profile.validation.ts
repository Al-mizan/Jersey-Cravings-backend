import z from "zod";

const updateMyProfileZodSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    profilePhoto: z
        .string()
        .url("Profile photo must be a valid URL")
        .optional(),
    contactNumber: z.string().min(6, "Contact number is invalid").optional(),
});

const changeCustomerStatusZodSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    status: z.enum(["ACTIVE", "BLOCKED", "DELETED"]),
});

export const CustomerProfileValidation = {
    updateMyProfileZodSchema,
    changeCustomerStatusZodSchema,
};
