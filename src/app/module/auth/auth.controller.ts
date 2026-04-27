import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookies";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";

const registerCustomer = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");
        const data = await AuthService.registerCustomer(
            payload,
            ipAddress,
            userAgent,
        );

        const { accessToken, refreshToken, token, ...rest } = data;
        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string); // better-auth.session_token, better-auth automatically pushes this cookie to the response when using better-auth, but we need to set it manually when using custom login/reg logic 


        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Customer registered successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest,
            },
        });
    }
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");
        const data = await AuthService.loginUser(payload, ipAddress, userAgent);

        const { accessToken, refreshToken, token, ...rest } = data;
        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token); // better-auth.session_token, better-auth automatically pushes this cookie to the response when using better-auth, but we need to set it manually when using custom login logic 

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest,
            },
        });
    }
);

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const data = await AuthService.getMe(user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data,
        });
    }
);

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"]; // better-auth.session_token is the session token that better-auth uses to manage the session, we can use this token to identify the session and refresh the tokens accordingly
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");

        if (!betterAuthSessionToken || !refreshToken) {
            throw new AppError(status.UNAUTHORIZED, 'Session token and refresh token are required');
        }

        const result = await AuthService.getNewToken(
            refreshToken,
            betterAuthSessionToken,
            ipAddress,
            userAgent,
        );

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken); // better-auth.session_token should be refreshed along with the access and refresh tokens to ensure that the session remains valid and active for the user

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New access token generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    }
);

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies['better-auth.session_token'];
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");

        const result = await AuthService.changePassword(
            payload,
            betterAuthSessionToken,
            ipAddress,
            userAgent,
        );
        const { accessToken, refreshToken, token } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password change successfully",
            data: result,
        });
    }
);

const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies['better-auth.session_token'];
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");

        if (!betterAuthSessionToken) {
            throw new AppError(status.UNAUTHORIZED, 'Session token is required for logout');
        }

        const result = await AuthService.logoutUser(
            betterAuthSessionToken,
            ipAddress,
            userAgent,
        );
        cookieUtils.clearCookie(res, 'accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        cookieUtils.clearCookie(res, 'refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        cookieUtils.clearCookie(res, 'better-auth.session_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result,
        });
    }
)

const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");
        await AuthService.verifyEmail(email, otp, ipAddress, userAgent);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
        });
    }
)

const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");
        await AuthService.forgetPassword(email, ipAddress, userAgent);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset OTP sent to email successfully",
        });
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");
        await AuthService.resetPassword(
            email,
            otp,
            newPassword,
            ipAddress,
            userAgent,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully",
        });
    }
)

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";

    const encodedRedirectPath = encodeURIComponent(redirectPath as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    res.render("googleRedirect", {
        callbackURL: callbackURL,
        betterAuthUrl: envVars.BETTER_AUTH_URL,
    })
})

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }
    const session = await auth.api.getSession({
        headers: {
            "Cookie": `better-auth.session_token=${sessionToken}`
        }
    })
    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }
    if (session && !session.user) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }
    const result = await AuthService.googleLoginSuccess(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    // ?redirect=//profile -> /profile
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
})

const handleOAuthError = catchAsync(async (req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
})

export const AuthController = {
    registerCustomer,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError,
};
