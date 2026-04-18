import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    // socialProviders: {
    //     google: {
    //         clientId: envVars.GOOGLE_CLIENT_ID,
    //         clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    //         accessType: "offline",
    //         prompt: "select_account",
    //         // callbackUrl: envVars.GOOGLE_CALLBACK_URL, eta dibo na ekhane
    //         mapProfileToUser: () => {
    //             return {
    //                 role: Role.PATIENT,
    //                 status: UserStatus.ACTIVE,
    //                 needPasswordChange: false,
    //                 emailVerified: true,
    //                 isDeleted: false,
    //                 deletedAt: null,
    //             };
    //         },
    //     },
    // },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "CUSTOMER",
            },

            status: {
                type: "string",
                required: true,
                defaultValue: "ACTIVE",
            },

            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },

            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },

            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null,
            },
        },
    },

    session: {
        expiresIn: 60 * 60 * 24, // 1 day in seconds
        updateAge: 60 * 60 * 24, // 1 day in seconds
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24, // 1 day in seconds
        },
    },

    redirectURLs: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },

    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:5000",
        envVars.FRONTEND_URL,
    ],

    advanced: {
        // disableCSRFCheck: true,
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                },
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                },
            },
        },
    },
});
