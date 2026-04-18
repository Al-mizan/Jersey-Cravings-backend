import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { Response } from "express";
// import ms, { StringValue } from "ms";
import { cookieUtils } from "./cookies";

const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions);
    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);
    return refreshToken;
}

const setAccessTokenCookie = (res: Response, token: string) => {
    // const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue); avabe krleo hoy
    cookieUtils.setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: true, //envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,    // 1 day
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: true, //envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: true, //envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // better-auth.session_token should have the same maxAge as the session expiresIn defined in betterAuth config, but since better-auth.session_token is automatically refreshed by better-auth when the user is active, we can set a long maxAge here and rely on better-auth to handle the actual expiration and refreshing of the token based on user activity
    });
}


export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
}