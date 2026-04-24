import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const giveReview = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user as IRequestUser;
    const result = await ReviewService.giveReview(
        user,
        payload,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Review created successfully",
        data: result,
    });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReviews(req.query);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieval successfully",
        data: result.data,
        meta: result.meta,
    });
});

const myReviews = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await ReviewService.myReviews(user, req.query);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieval successfully",
        data: result.data,
        meta: result.meta,
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const reviewId = req.params.id;
    const payload = req.body;

    const result = await ReviewService.updateReview(
        user,
        reviewId as string,
        payload,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Review updated successfully",
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const reviewId = req.params.id;
    const result = await ReviewService.deleteReview(
        user,
        reviewId as string,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Review deleted successfully",
        data: result,
    });
});

const moderateReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.moderateReview(
        req.params.id as string,
        req.body.isApproved,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Review moderation updated successfully",
        data: result,
    });
});

export const ReviewController = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview,
    moderateReview,
};
