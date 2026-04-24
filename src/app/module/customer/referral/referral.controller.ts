import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { CustomerReferralService } from "./referral.service";

const getOrCreateMyReferralCode = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CustomerReferralService.getOrCreateMyReferralCode(
            req.user as IRequestUser,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Referral code retrieved successfully",
            data: result,
        });
    },
);

const getMyReferralEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerReferralService.getMyReferralEvents(
        req.user as IRequestUser,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Referral events retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getAllReferralEventsForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await CustomerReferralService.getAllReferralEventsForAdmin(
                req.query,
            );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Referral events retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    },
);

const overrideReferralStatus = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CustomerReferralService.overrideReferralStatus(
            req.body,
            req.user as IRequestUser,
            req.ip,
            req.get("user-agent"),
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Referral status changed successfully",
            data: result,
        });
    },
);

export const CustomerReferralController = {
    getOrCreateMyReferralCode,
    getMyReferralEvents,
    getAllReferralEventsForAdmin,
    overrideReferralStatus,
};
