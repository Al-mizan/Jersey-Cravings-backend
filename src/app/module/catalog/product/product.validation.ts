import z from "zod";

export const createProductZodSchema = z.object({
    title: z
        .string("Product title is required")
        .min(3, "Product title must be at least 3 characters")
        .max(200, "Product title must be at most 200 characters"),
    slug: z
        .string("Product slug is required")
        .min(3, "Product slug must be at least 3 characters")
        .max(200, "Product slug must be at most 200 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must be lowercase with hyphens only",
        ),
    description: z
        .string("Product description must be string")
        .max(5000, "Product description must be at most 5000 characters")
        .optional(),
    teamName: z
        .string("Team name is required")
        .min(2, "Team name must be at least 2 characters")
        .max(100, "Team name must be at most 100 characters"),
    tournamentTag: z
        .string("Tournament tag is required")
        .min(2, "Tournament tag must be at least 2 characters")
        .max(100, "Tournament tag must be at most 100 characters"),
    jerseyType: z.enum(
        ["HOME", "AWAY", "THIRD", "GK", "SPECIAL"],
        "Jersey type must be one of: HOME, AWAY, THIRD, GK, SPECIAL",
    ),
    categoryId: z
        .string("Category ID is required")
        .uuid("Category ID must be a valid UUID"),
});

export const updateProductZodSchema = z.object({
    title: z
        .string("Product title must be string")
        .min(3, "Product title must be at least 3 characters")
        .max(200, "Product title must be at most 200 characters")
        .optional(),
    slug: z
        .string("Product slug must be string")
        .min(3, "Product slug must be at least 3 characters")
        .max(200, "Product slug must be at most 200 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must be lowercase with hyphens only",
        )
        .optional(),
    description: z
        .string("Product description must be string")
        .max(5000, "Product description must be at most 5000 characters")
        .optional(),
    teamName: z
        .string("Team name must be string")
        .min(2, "Team name must be at least 2 characters")
        .max(100, "Team name must be at most 100 characters")
        .optional(),
    tournamentTag: z
        .string("Tournament tag must be string")
        .min(2, "Tournament tag must be at least 2 characters")
        .max(100, "Tournament tag must be at most 100 characters")
        .optional(),
    jerseyType: z
        .enum(
            ["HOME", "AWAY", "THIRD", "GK", "SPECIAL"],
            "Jersey type must be one of: HOME, AWAY, THIRD, GK, SPECIAL",
        )
        .optional(),
    categoryId: z
        .string("Category ID must be string")
        .uuid("Category ID must be a valid UUID")
        .optional(),
});

export const updateProductStatusZodSchema = z.object({
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
});

export const queryProductZodSchema = z.object({
    searchTerm: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
    categoryId: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
