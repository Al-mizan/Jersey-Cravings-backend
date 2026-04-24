import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const result = await DashboardService.getDashboardSummary();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: result,
    });
});

const getCatalogStats = catchAsync(async (req: Request, res: Response) => {
    const result = await DashboardService.getCatalogStats();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Catalog statistics retrieved successfully",
        data: result,
    });
});

const getOrderStats = catchAsync(async (req: Request, res: Response) => {
    const result = await DashboardService.getOrderStats();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Order statistics retrieved successfully",
        data: result,
    });
});

const getCustomerStats = catchAsync(async (req: Request, res: Response) => {
    const result = await DashboardService.getCustomerStats();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer statistics retrieved successfully",
        data: result,
    });
});

export const DashboardController = {
    getDashboardSummary,
    getCatalogStats,
    getOrderStats,
    getCustomerStats,
};
