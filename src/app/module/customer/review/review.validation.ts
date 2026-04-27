import { z } from "zod";

const createReviewZodSchema = z.object({
    productId: z.string("Product ID is required"),
    rating: z
        .number("Rating is required")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5"),
    comment: z.string("Comment must be valid").optional(),
    medias: z
        .array(
            z.object({
                publicId: z.string().min(1, "Public ID is required"),
                secureUrl: z.string().url("Media URL must be valid"),
                resourceType: z.string().min(1, "Resource type is required"),
            }),
        )
        .max(6)
        .optional(),
});

const updateReviewZodSchema = z.object({
    rating: z
        .number("Rating is required")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5")
        .optional(),
    comment: z.string("Comment must be valid").optional(),
    medias: z
        .array(
            z.object({
                publicId: z.string().min(1, "Public ID is required"),
                secureUrl: z.string().url("Media URL must be valid"),
                resourceType: z.string().min(1, "Resource type is required"),
            }),
        )
        .max(6)
        .optional(),
});

const moderateReviewZodSchema = z.object({
    isApproved: z.boolean(),
});

export const ReviewValidation = {
    createReviewZodSchema,
    updateReviewZodSchema,
    moderateReviewZodSchema,
};
