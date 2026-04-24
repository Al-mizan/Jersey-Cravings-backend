import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { CategoryService } from "./category.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await CategoryService.createCategory(
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Categories retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.getCategoryById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category retrieved successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");
    const { id } = req.params;

    const result = await CategoryService.updateCategory(
        id as string,
        req.body,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});

const softDeleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await CategoryService.softDeleteCategory(
        id as string,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category deleted successfully",
        data: result,
    });
});

const restoreCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const result = await CategoryService.restoreCategory(
        id as string,
        user,
        ipAddress,
        userAgent,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category restored successfully",
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    softDeleteCategory,
    restoreCategory,
};
