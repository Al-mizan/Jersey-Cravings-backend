import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { ProductVariantService } from "./product-variant.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const createVariant = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { productId } = req.params;

    const result = await ProductVariantService.createProductVariant(
        productId as string,
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Product variant created successfully",
        data: result,
    });
});

const getVariants = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await ProductVariantService.getProductVariants(
        productId as string,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product variants retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getVariantById = catchAsync(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params;
    const result = await ProductVariantService.getVariantById(
        productId as string,
        variantId as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product variant retrieved successfully",
        data: result,
    });
});

const updateVariant = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { productId, variantId } = req.params;

    const result = await ProductVariantService.updateVariant(
        productId as string,
        variantId as string,
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product variant updated successfully",
        data: result,
    });
});

const deleteVariant = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { productId, variantId } = req.params;

    const result = await ProductVariantService.deleteVariant(
        productId as string,
        variantId as string,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product variant deleted successfully",
        data: result,
    });
});

export const ProductVariantController = {
    createVariant,
    getVariants,
    getVariantById,
    updateVariant,
    deleteVariant,
};
