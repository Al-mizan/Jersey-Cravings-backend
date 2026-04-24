import z from "zod";

const addToCartZodSchema = z.object({
    variantId: z.string().min(1, "Variant ID is required"),
    qty: z.number().int().positive("Quantity must be positive").max(10),
});

const updateCartItemZodSchema = z.object({
    qty: z.number().int().positive("Quantity must be positive").max(10),
});

export const CartValidation = {
    addToCartZodSchema,
    updateCartItemZodSchema,
};
