import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import {
    iChangePasswordPayload,
    ILoginUserPayload,
    IRegisterCustomerPayload,
    iSessionData,
} from "./auth.interface";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interface/requestUser.interface";
import { envVars } from "../../config/env";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

const registerCustomer = async (payload: IRegisterCustomerPayload) => {
    const { email, password, name } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        },
    });
    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Registration failed");
    }
    try {
        const customer = await prisma.customer.create({
            data: {
                userId: data.user.id,
                name: payload.name,
                email: payload.email,
            },
        });

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });

        return {
            ...data,
            accessToken,
            refreshToken,
            customer,
        };
    } catch (error) {
        console.log("Transaction Error: ", error);
        await prisma.user.delete({
            where: {
                id: data.user.id,
            },
        });
        throw error;
    }
};

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        },
    });
    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };
};

const getMe = async (user: IRequestUser) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            customer: true,
            accounts: {
                select: {
                    providerId: true,
                },
            },
            admin: true,
        },
    });

    if (!userData) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return userData;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
    const isSessionTokenExist = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true,
        },
    });

    if (!isSessionTokenExist) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(
        refreshToken,
        envVars.REFRESH_TOKEN_SECRET,
    );

    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken,
        },
        data: {
            token: sessionToken,
            // refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // session should have the same expiration as the refresh token, but since better-auth.session_token is automatically refreshed by better-auth when the user is active, we can set a long expiration here and rely on better-auth to handle the actual expiration and refreshing of the token based on user activity
            updatedAt: new Date(),
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    };
};

const changePassword = async (
    payload: iChangePasswordPayload,
    sessionToken: string,
) => {
    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });
    if (!session) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }
    const { currentPassword, newPassword } = payload;
    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true, // logout other sessions except the current one
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    return {
        ...result,
        accessToken,
        refreshToken,
    };
};

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });

    return result;
};

const verifyEmail = async (email: string, otp: string) => {
    // google login user should not be able to use verify email feature
    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            accounts: {
                select: {
                    providerId: true,
                },
            },
        },
    });
    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    if (
        isUserExist.accounts.some((account) => account.providerId === "google")
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "Google login user cannot use verify email feature",
        );
    }

    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp,
        },
    });

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                emailVerified: true,
            },
        });
    }
};

const forgetPassword = async (email: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            accounts: {
                select: {
                    providerId: true,
                },
            },
        },
    });

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    // google login user should not be able to use forget password feature
    if (
        isUserExist.accounts.some((account) => account.providerId === "google")
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "Google login user cannot use forget password feature",
        );
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email,
        },
    });
};

const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            accounts: {
                select: {
                    providerId: true,
                },
            },
        },
    });

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    // google login user should not be able to use forget password feature
    if (
        isUserExist.accounts.some((account) => account.providerId === "google")
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "Google login user cannot use forget password feature",
        );
    }

    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password: newPassword,
        },
    });

    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isUserExist.id,
            },
            data: {
                needPasswordChange: false,
            },
        });
    }

    await prisma.session.deleteMany({
        where: {
            userId: isUserExist.id,
        },
    });
};

const googleLoginSuccess = async (session: iSessionData) => {
    const isCustomerExists = await prisma.customer.findUnique({
        where: {
            userId: session.user.id,
        },
    });

    if (!isCustomerExists) {
        await prisma.customer.create({
            data: {
                userId: session.user.id,
                name: session.user.name,
                email: session.user.email,
            },
        });
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    return {
        accessToken,
        refreshToken,
    };
};

export const AuthService = {
    registerCustomer,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSuccess,
};
