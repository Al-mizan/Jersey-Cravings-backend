import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { ActivityService } from "./activity.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const getUserActivity = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await ActivityService.getUserActivity(user, req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User activity retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getEntityActivity = catchAsync(async (req: Request, res: Response) => {
    const { entityType, entityId } = req.params;
    const result = await ActivityService.getEntityActivity(
        entityType as string,
        entityId as string,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Entity activity retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getActivityTimeline = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const result = await ActivityService.getActivityTimeline(user, days);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Activity timeline retrieved successfully",
        data: result,
    });
});

export const ActivityController = {
    getUserActivity,
    getEntityActivity,
    getActivityTimeline,
};
