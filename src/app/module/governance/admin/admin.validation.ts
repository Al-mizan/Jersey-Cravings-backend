import z from "zod";

export const updateAdminZodSchema = z.object({
    name: z
        .string("Admin name must be string")
        .min(3, "Admin name must be at least 3 characters")
        .max(100, "Admin name must be at most 100 characters")
        .optional(),
    profilePhoto: z
        .string("Profile photo must be string")
        .url("Profile photo must be a valid URL")
        .optional(),
    contactNumber: z
        .string("Contact number must be string")
        .min(11, "Contact number must be at least 11 characters")
        .max(15, "Contact number must be at most 15 characters")
        .optional(),
});

export const changeUserStatusZodSchema = z.object({
    userId: z
        .string("User ID is required")
        .uuid("User ID must be a valid UUID"),
    status: z.enum(
        ["ACTIVE", "BLOCKED", "DELETED"],
        "Status must be one of: ACTIVE, BLOCKED, DELETED",
    ),
});

export const changeUserRoleZodSchema = z.object({
    userId: z
        .string("User ID is required")
        .uuid("User ID must be a valid UUID"),
    role: z.enum(
        ["ADMIN", "SUPER_ADMIN"],
        "Role must be either ADMIN or SUPER_ADMIN",
    ),
});

export const queryAdminZodSchema = z.object({
    searchTerm: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
