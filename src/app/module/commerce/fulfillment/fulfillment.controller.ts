import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { FulfillmentService } from "./fulfillment.service";

const getActivePickupLocations = catchAsync(
    async (_req: Request, res: Response) => {
        const result = await FulfillmentService.getActivePickupLocations();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Pickup locations retrieved successfully",
            data: result,
        });
    },
);

const getPickupLocations = catchAsync(async (req: Request, res: Response) => {
    const result = await FulfillmentService.getPickupLocations(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Pickup locations retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const createPickupLocation = catchAsync(async (req: Request, res: Response) => {
    const result = await FulfillmentService.createPickupLocation(
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Pickup location created successfully",
        data: result,
    });
});

const updatePickupLocation = catchAsync(async (req: Request, res: Response) => {
    const result = await FulfillmentService.updatePickupLocation(
        req.params.locationId as string,
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Pickup location updated successfully",
        data: result,
    });
});

const deletePickupLocation = catchAsync(async (req: Request, res: Response) => {
    const result = await FulfillmentService.deletePickupLocation(
        req.params.locationId as string,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Pickup location deleted successfully",
        data: result,
    });
});

export const FulfillmentController = {
    getActivePickupLocations,
    getPickupLocations,
    createPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
};
