/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { Role } from "../../../../generated/prisma/enums";
import { IAuditLogQueryParams } from "./audit-log.interface";

const getMyActivity = async (
    user: IRequestUser,
    queryParams: IAuditLogQueryParams,
) => {
    const queryBuilder = new QueryBuilder(
        prisma.auditLog,
        { ...queryParams, actorUserId: user.userId },
        {
            filterableFields: ["actorUserId"],
        },
    );

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    actorUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const getAuditLogs = async (queryParams: IAuditLogQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.auditLog, queryParams, {
        searchableFields: ["action", "entityType", "entityId"],
        filterableFields: ["actorRole", "action", "entityType"],
    });

    // Handle date range filtering
    if (queryParams.startDate || queryParams.endDate) {
        const createdAtFilter: any = {};
        if (queryParams.startDate) {
            createdAtFilter.gte = new Date(queryParams.startDate);
        }
        if (queryParams.endDate) {
            createdAtFilter.lte = new Date(queryParams.endDate);
        }
        queryBuilder.where({ createdAt: createdAtFilter } as any);
    }

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    actorUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const getAuditLogById = async (id: string) => {
    const log = await prisma.auditLog.findUnique({
        where: { id },
        include: {
            actorUser: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!log) {
        throw new AppError(status.NOT_FOUND, "Audit log entry not found");
    }

    return log;
};

const getEntityAuditLogs = async (
    entityType: string,
    entityId: string,
    queryParams: IAuditLogQueryParams,
) => {
    const queryBuilder = new QueryBuilder(
        prisma.auditLog,
        { ...queryParams, entityType, entityId },
        {
            filterableFields: ["entityType", "entityId", "action"],
        },
    );

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    actorUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const getEntityActivity = async (
    entityType: string,
    entityId: string,
    queryParams: IAuditLogQueryParams,
) => {
    const queryBuilder = new QueryBuilder(
        prisma.auditLog,
        { ...queryParams, entityType, entityId },
        {
            filterableFields: ["entityType", "entityId"],
        },
    );

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    actorUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const getActivityTimeline = async (user: IRequestUser, days: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
        throw new AppError(
            status.FORBIDDEN,
            "Only admin users can access activity timeline",
        );
    }

    const logs = await prisma.auditLog.findMany({
        where: {
            createdAt: { gte: startDate },
        },
        include: {
            actorUser: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    const timeline: Record<string, typeof logs> = {};
    logs.forEach((log) => {
        const date = log.createdAt.toISOString().split("T")[0];
        if (!timeline[date]) {
            timeline[date] = [];
        }
        timeline[date].push(log);
    });

    return timeline;
};

export const AuditLogService = {
    getAuditLogs,
    getAuditLogById,
    getEntityAuditLogs,
    getMyActivity,
    getEntityActivity,
    getActivityTimeline,
};
