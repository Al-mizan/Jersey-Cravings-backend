import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { BulkActionService } from "./bulk-action.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const bulkPublishProducts = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await BulkActionService.bulkPublishProducts(
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bulk publish operation completed",
        data: result,
    });
});

const bulkArchiveProducts = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await BulkActionService.bulkArchiveProducts(
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bulk archive operation completed",
        data: result,
    });
});

const bulkToggleCategories = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await BulkActionService.bulkToggleCategories(
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bulk category toggle operation completed",
        data: result,
    });
});

const bulkToggleCoupons = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await BulkActionService.bulkToggleCoupons(
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bulk coupon toggle operation completed",
        data: result,
    });
});

export const BulkActionController = {
    bulkPublishProducts,
    bulkArchiveProducts,
    bulkToggleCategories,
    bulkToggleCoupons,
};
