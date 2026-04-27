import z from "zod";

const registerCustomerZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Email must be valid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginUserZodSchema = z.object({
    email: z.email("Email must be valid"),
    password: z.string().min(1, "Password is required"),
});

const changePasswordZodSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const verifyEmailZodSchema = z.object({
    email: z.email("Email must be valid"),
    otp: z.string().min(1, "OTP is required"),
});

const forgetPasswordZodSchema = z.object({
    email: z.email("Email must be valid"),
});

const resetPasswordZodSchema = z.object({
    email: z.email("Email must be valid"),
    otp: z.string().min(1, "OTP is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const AuthValidation = {
    registerCustomerZodSchema,
    loginUserZodSchema,
    changePasswordZodSchema,
    verifyEmailZodSchema,
    forgetPasswordZodSchema,
    resetPasswordZodSchema,
};
