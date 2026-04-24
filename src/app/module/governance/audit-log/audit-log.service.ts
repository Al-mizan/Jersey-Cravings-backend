/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { IAuditLogQueryParams } from "./audit-log.interface";

const getAuditLogs = async (queryParams: IAuditLogQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.auditLog, queryParams, {
        searchableFields: ["action", "entityType", "entityId"],
        filterableFields: ["actorRole", "action", "entityType"],
    });

    // Handle date range filtering
    const where = queryBuilder.getWhere();
    if (queryParams.startDate || queryParams.endDate) {
        const createdAtFilter: any = {};
        if (queryParams.startDate) {
            createdAtFilter.gte = new Date(queryParams.startDate);
        }
        if (queryParams.endDate) {
            createdAtFilter.lte = new Date(queryParams.endDate);
        }
        (where as any).createdAt = createdAtFilter;
    }

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    actor: {
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
                    actor: {
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

export const AuditLogService = {
    getAuditLogs,
    getAuditLogById,
    getEntityAuditLogs,
};
