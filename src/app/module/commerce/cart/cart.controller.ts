import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { CartService } from "./cart.service";

const getMyCart = catchAsync(async (req: Request, res: Response) => {
    const result = await CartService.getMyCart(req.user as IRequestUser);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Cart retrieved successfully",
        data: result,
    });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
    const result = await CartService.addToCart(
        req.user as IRequestUser,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Item added to cart successfully",
        data: result,
    });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
    const result = await CartService.updateCartItem(
        req.user as IRequestUser,
        req.params.cartItemId as string,
        req.body,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Cart item updated successfully",
        data: result,
    });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
    const result = await CartService.removeCartItem(
        req.user as IRequestUser,
        req.params.cartItemId as string,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Cart item removed successfully",
        data: result,
    });
});

const clearMyCart = catchAsync(async (req: Request, res: Response) => {
    const result = await CartService.clearMyCart(
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Cart cleared successfully",
        data: result,
    });
});

const getCustomerCartForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CartService.getCustomerCartForAdmin(
            req.params.userId as string,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Customer cart retrieved successfully",
            data: result,
        });
    },
);

export const CartController = {
    getMyCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearMyCart,
    getCustomerCartForAdmin,
};
