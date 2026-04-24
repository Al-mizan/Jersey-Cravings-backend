import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { CustomerLoyaltyService } from "./loyalty.service";

const getMyLoyaltySummary = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerLoyaltyService.getMyLoyaltySummary(
        req.user as IRequestUser,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Loyalty summary retrieved successfully",
        data: result,
    });
});

const getMyPointTransactions = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CustomerLoyaltyService.getMyPointTransactions(
            req.user as IRequestUser,
            req.query,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Point transactions retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    },
);

const getCustomerLoyaltyByAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CustomerLoyaltyService.getCustomerLoyaltyByAdmin(
            req.params.customerId as string,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Customer loyalty retrieved successfully",
            data: result,
        });
    },
);

const getActiveLoyaltySetting = catchAsync(
    async (_req: Request, res: Response) => {
        const result = await CustomerLoyaltyService.getActiveLoyaltySetting();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Loyalty setting retrieved successfully",
            data: result,
        });
    },
);

const updateLoyaltySetting = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerLoyaltyService.updateLoyaltySetting(
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Loyalty setting updated successfully",
        data: result,
    });
});

export const CustomerLoyaltyController = {
    getMyLoyaltySummary,
    getMyPointTransactions,
    getCustomerLoyaltyByAdmin,
    getActiveLoyaltySetting,
    updateLoyaltySetting,
};
