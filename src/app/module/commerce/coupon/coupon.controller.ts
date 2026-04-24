import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { CouponService } from "./coupon.service";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.createCoupon(
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Coupon created successfully",
        data: result,
    });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.getAllCoupons(req.query);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Coupons retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getPublicCoupons = catchAsync(async (_req: Request, res: Response) => {
    const result = await CouponService.getPublicCoupons();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Public coupons retrieved successfully",
        data: result,
    });
});

const getCouponById = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.getCouponById(
        req.params.couponId as string,
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Coupon retrieved successfully",
        data: result,
    });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.updateCoupon(
        req.params.couponId as string,
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Coupon updated successfully",
        data: result,
    });
});

const softDeleteCoupon = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.softDeleteCoupon(
        req.params.couponId as string,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Coupon deleted successfully",
        data: result,
    });
});

const restoreCoupon = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.restoreCoupon(
        req.params.couponId as string,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Coupon restored successfully",
        data: result,
    });
});

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponService.validateCoupon(req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Coupon validated successfully",
        data: result,
    });
});

export const CouponController = {
    createCoupon,
    getAllCoupons,
    getPublicCoupons,
    getCouponById,
    updateCoupon,
    softDeleteCoupon,
    restoreCoupon,
    validateCoupon,
};
