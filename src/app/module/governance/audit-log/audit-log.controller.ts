import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { AuditLogService } from "./audit-log.service";
import { IRequestUser } from "../../../interface/requestUser.interface";

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const result = await AuditLogService.getAuditLogs(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getAuditLogById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AuditLogService.getAuditLogById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Audit log retrieved successfully",
        data: result,
    });
});

const getEntityAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const { entityType, entityId } = req.params;
    const result = await AuditLogService.getEntityAuditLogs(
        entityType as string,
        entityId as string,
        req.query,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Entity audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMyActivity = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await AuditLogService.getMyActivity(user, req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My activity retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getActivityTimeline = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const result = await AuditLogService.getActivityTimeline(user, days);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Activity timeline retrieved successfully",
        data: result,
    });
});

export const AuditLogController = {
    getAuditLogs,
    getAuditLogById,
    getEntityAuditLogs,
    getMyActivity,
    getActivityTimeline,
};
