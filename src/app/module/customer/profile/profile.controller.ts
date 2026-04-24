import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { CustomerProfileService } from "./profile.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerProfileService.getMyProfile(
        req.user as IRequestUser,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer profile retrieved successfully",
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await CustomerProfileService.updateMyProfile(
        user,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer profile updated successfully",
        data: result,
    });
});

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerProfileService.getAllCustomers(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customers retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCustomerById = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerProfileService.getCustomerById(
        req.params.customerId as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer retrieved successfully",
        data: result,
    });
});

const changeCustomerStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerProfileService.changeCustomerStatus(
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer status changed successfully",
        data: result,
    });
});

const restoreCustomer = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerProfileService.restoreCustomer(
        req.params.customerId as string,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer restored successfully",
        data: result,
    });
});

export const CustomerProfileController = {
    getMyProfile,
    updateMyProfile,
    getAllCustomers,
    getCustomerById,
    changeCustomerStatus,
    restoreCustomer,
};
