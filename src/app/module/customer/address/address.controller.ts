import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { AddressService } from "./address.service";

const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.getMyAddresses(
        req.user as IRequestUser,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Addresses retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const createAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.createAddress(
        req.user as IRequestUser,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Address created successfully",
        data: result,
    });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.updateAddress(
        req.params.addressId as string,
        req.user as IRequestUser,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Address updated successfully",
        data: result,
    });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.deleteAddress(
        req.params.addressId as string,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Address deleted successfully",
        data: result,
    });
});

const getCustomerAddressesForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await AddressService.getCustomerAddressesForAdmin(
            req.params.customerId as string,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Customer addresses retrieved successfully",
            data: result,
        });
    },
);

export const AddressController = {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    getCustomerAddressesForAdmin,
};
