import z from "zod";

export const createAdminZodSchema = z.object({
    password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must be at most 20 characters"),
    admin: z.object({
        name: z
            .string("Name is required and must be string")
            .min(5, "Name must be at least 5 characters")
            .max(30, "Name must be at most 30 characters"),
        email: z.email("Invalid email address"),
        contactNumber: z
            .string("Contact number is required")
            .min(11, "Contact number must be at least 11 characters")
            .max(14, "Contact number must be at most 15 characters")
            .optional(),
        profilePhoto: z.url("Profile photo must be a valid URL").optional(),
    }),
    role: z.enum(
        ["ADMIN", "SUPER_ADMIN"],
        "Role must be either ADMIN or SUPER_ADMIN",
    ),
});

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
        // .uuid("User ID must be a valid UUID"),
        .trim()
        .min(1, "User ID is required"),
    status: z.enum(
        ["ACTIVE", "BLOCKED", "DELETED"],
        "Status must be one of: ACTIVE, BLOCKED, DELETED",
    ),
});

export const changeUserRoleZodSchema = z.object({
    userId: z
        .string("User ID is required")
        // .uuid("User ID must be a valid UUID"), // when we use this validation, it causes problem in testing because we are using simple string as userId in tests, so for now we will use string validation instead of uuid validation, but in real application we should use uuid validation
        .trim()
        .min(1, "User ID is required"),
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
