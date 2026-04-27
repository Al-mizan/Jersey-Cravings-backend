import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { ProductService } from "./product.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await ProductService.createProduct(
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Product created successfully in DRAFT status",
        data: result,
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.getAllProducts(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.getProductById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { id } = req.params;

    const result = await ProductService.updateProduct(
        id as string,
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product updated successfully",
        data: result,
    });
});

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const result = await ProductService.updateProductStatus(
        id as string,
        newStatus,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product status updated successfully",
        data: result,
    });
});

const softDeleteProduct = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const { id } = req.params;
    const result = await ProductService.softDeleteProduct(
        id as string,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product deleted successfully",
        data: result,
    });
});

const restoreProduct = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { id } = req.params;

    const result = await ProductService.restoreProduct(
        id as string,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product restored successfully",
        data: result,
    });
});

export const ProductController = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    softDeleteProduct,
    restoreProduct,
};
