import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { ProductMediaService } from "./product-media.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const createMedia = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { productId } = req.params;

    const result = await ProductMediaService.createProductMedia(
        productId as string,
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Product media created successfully",
        data: result,
    });
});

const getMedia = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await ProductMediaService.getProductMedia(
        productId as string,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product media retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMediaById = catchAsync(async (req: Request, res: Response) => {
    const { productId, mediaId } = req.params;
    const result = await ProductMediaService.getMediaById(
        productId as string,
        mediaId as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product media retrieved successfully",
        data: result,
    });
});

const updateMedia = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const { productId, mediaId } = req.params;
    const result = await ProductMediaService.updateMedia(
        productId as string,
        mediaId as string,
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product media updated successfully",
        data: result,
    });
});

const reorderMedia = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const { productId } = req.params;
    const result = await ProductMediaService.reorderMedia(
        productId as string,
        req.body.mediaOrder,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product media reordered successfully",
        data: result,
    });
});

const deleteMedia = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const { productId, mediaId } = req.params;
    const result = await ProductMediaService.deleteMedia(
        productId as string,
        mediaId as string,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product media deleted successfully",
        data: result,
    });
});

export const ProductMediaController = {
    createMedia,
    getMedia,
    getMediaById,
    updateMedia,
    reorderMedia,
    deleteMedia,
};
