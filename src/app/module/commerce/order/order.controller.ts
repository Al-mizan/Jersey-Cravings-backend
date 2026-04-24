import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.createOrder(
        req.user as IRequestUser,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Order created successfully",
        data: result,
    });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getMyOrders(
        req.user as IRequestUser,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMyOrderById = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getMyOrderById(
        req.user as IRequestUser,
        req.params.orderId as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Order retrieved successfully",
        data: result,
    });
});

const cancelMyOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.cancelMyOrder(
        req.user as IRequestUser,
        req.params.orderId as string,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Order cancelled successfully",
        data: result,
    });
});

const getAllOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getAllOrdersForAdmin(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getOrderByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getOrderByIdForAdmin(
        req.params.orderId as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Order retrieved successfully",
        data: result,
    });
});

const updateOrderStatusByAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await OrderService.updateOrderStatusByAdmin(
            req.params.orderId as string,
            req.body,
            req.user as IRequestUser,
            req.ip,
            req.get("user-agent"),
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Order status updated successfully",
            data: result,
        });
    },
);

export const OrderController = {
    createOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    getAllOrdersForAdmin,
    getOrderByIdForAdmin,
    updateOrderStatusByAdmin,
};
