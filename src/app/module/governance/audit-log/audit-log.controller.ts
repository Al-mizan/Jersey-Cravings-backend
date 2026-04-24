import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { AuditLogService } from "./audit-log.service";

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

export const AuditLogController = {
    getAuditLogs,
    getAuditLogById,
    getEntityAuditLogs,
};
