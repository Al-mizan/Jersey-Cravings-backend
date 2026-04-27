import z from "zod";

export const cloudinaryMediaZodSchema = z.object({
    publicId: z.string().min(1, "Public ID is required"),
    secureUrl: z.string().url("Media URL must be valid"),
    resourceType: z.enum(["image", "video", "raw"]),
});
