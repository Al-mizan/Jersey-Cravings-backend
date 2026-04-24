import z from "zod";

export const createProductVariantZodSchema = z.object({
    sku: z
        .string("SKU is required")
        .min(3, "SKU must be at least 3 characters")
        .max(50, "SKU must be at most 50 characters"),
    size: z.enum(
        ["S", "M", "L", "XL", "XXL"],
        "Size must be one of: S, M, L, XL, XXL",
    ),
    fit: z.enum(["PLAYER", "FAN"], "Fit must be either PLAYER or FAN"),
    sleeveType: z.enum(
        ["SHORT", "LONG"],
        "Sleeve type must be either SHORT or LONG",
    ),
    priceAmount: z
        .number("Price amount must be a number")
        .int("Price amount must be an integer")
        .positive("Price amount must be positive"),
    compareAtAmount: z
        .number("Compare at amount must be a number")
        .int("Compare at amount must be an integer")
        .positive("Compare at amount must be positive")
        .optional(),
    costAmount: z
        .number("Cost amount must be a number")
        .int("Cost amount must be an integer")
        .positive("Cost amount must be positive")
        .optional(),
    stockQty: z
        .number("Stock quantity must be a number")
        .int("Stock quantity must be an integer")
        .nonnegative("Stock quantity must be non-negative"),
});

export const updateProductVariantZodSchema = z.object({
    size: z
        .enum(
            ["S", "M", "L", "XL", "XXL"],
            "Size must be one of: S, M, L, XL, XXL",
        )
        .optional(),
    fit: z
        .enum(["PLAYER", "FAN"], "Fit must be either PLAYER or FAN")
        .optional(),
    sleeveType: z
        .enum(["SHORT", "LONG"], "Sleeve type must be either SHORT or LONG")
        .optional(),
    priceAmount: z
        .number("Price amount must be a number")
        .int("Price amount must be an integer")
        .positive("Price amount must be positive")
        .optional(),
    compareAtAmount: z
        .number("Compare at amount must be a number")
        .int("Compare at amount must be an integer")
        .positive("Compare at amount must be positive")
        .optional(),
    costAmount: z
        .number("Cost amount must be a number")
        .int("Cost amount must be an integer")
        .positive("Cost amount must be positive")
        .optional(),
    stockQty: z
        .number("Stock quantity must be a number")
        .int("Stock quantity must be an integer")
        .nonnegative("Stock quantity must be non-negative")
        .optional(),
    isActive: z.boolean("isActive must be boolean").optional(),
});
