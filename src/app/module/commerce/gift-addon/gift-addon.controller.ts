import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { GiftAddonService } from "./gift-addon.service";

const getMyOrderGiftAddon = catchAsync(async (req: Request, res: Response) => {
    const result = await GiftAddonService.getMyOrderGiftAddon(
        req.user as IRequestUser,
        req.params.orderId as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Gift add-on retrieved successfully",
        data: result,
    });
});

const upsertOrderGiftAddon = catchAsync(async (req: Request, res: Response) => {
    const result = await GiftAddonService.upsertOrderGiftAddon(
        req.user as IRequestUser,
        req.params.orderId as string,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Gift add-on saved successfully",
        data: result,
    });
});

const removeOrderGiftAddon = catchAsync(async (req: Request, res: Response) => {
    const result = await GiftAddonService.removeOrderGiftAddon(
        req.user as IRequestUser,
        req.params.orderId as string,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Gift add-on removed successfully",
        data: result,
    });
});

const getGiftAddonByOrderForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await GiftAddonService.getGiftAddonByOrderForAdmin(
            req.params.orderId as string,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Gift add-on retrieved successfully",
            data: result,
        });
    },
);

export const GiftAddonController = {
    getMyOrderGiftAddon,
    upsertOrderGiftAddon,
    removeOrderGiftAddon,
    getGiftAddonByOrderForAdmin,
};
