import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { IActivityQueryParams } from "./activity.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { Role } from "../../../../generated/prisma/enums";

const getUserActivity = async (
    user: IRequestUser,
    queryParams: IActivityQueryParams,
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

const getEntityActivity = async (
    entityType: string,
    entityId: string,
    queryParams: IActivityQueryParams,
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

const getActivityTimeline = async (user: IRequestUser, days: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get admin activities for timeline
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

    // Group by date
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

export const ActivityService = {
    getUserActivity,
    getEntityActivity,
    getActivityTimeline,
};
