import z from "zod";

export const createProductMediaZodSchema = z.object({
    publicId: z
        .string("Public ID is required")
        .min(1, "Public ID must not be empty"),
    secureUrl: z
        .string("Secure URL is required")
        .url("Secure URL must be a valid URL"),
    resourceType: z.enum(
        ["image", "video"],
        "Resource type must be either image or video",
    ),
    altText: z
        .string("Alt text must be string")
        .max(200, "Alt text must be at most 200 characters")
        .optional(),
});

export const reorderMediaZodSchema = z.object({
    mediaOrder: z
        .array(
            z.object({
                id: z.string("Media ID must be string"),
                sortOrder: z.number("Sort order must be number").nonnegative(),
            }),
        )
        .min(1, "At least one media item must be provided"),
});
