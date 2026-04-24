import status from "http-status";
import {
    Prisma,
    ReferralRewardStatus,
} from "../../../../generated/prisma/client";
import AppError from "../../../errorHelpers/AppError";
import { IAuditLog } from "../../../interface/logging.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    IOverrideReferralStatusPayload,
    IReferralEventQueryParams,
} from "./referral.interface";

const logAudit = async ({
    actorRole,
    actorUserId,
    action,
    entityType,
    entityId,
    beforeState,
    afterState,
    ipAddress,
    userAgent,
}: IAuditLog) => {
    await prisma.auditLog.create({
        data: {
            actorUserId,
            actorRole,
            action,
            entityType,
            entityId,
            beforeState: beforeState as Prisma.InputJsonValue,
            afterState: afterState as Prisma.InputJsonValue,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
        },
    });
};

const getOrCreateMyReferralCode = async (user: IRequestUser) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });
    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    const existingCode = await prisma.referralCode.findUnique({
        where: { ownerCustomerId: customer.id },
    });

    if (existingCode) {
        return existingCode;
    }

    const code = `JC-${customer.id.slice(0, 6).toUpperCase()}`;

    return await prisma.referralCode.create({
        data: {
            ownerCustomerId: customer.id,
            code,
            isActive: true,
        },
    });
};

const getMyReferralEvents = async (
    user: IRequestUser,
    queryParams: IReferralEventQueryParams,
) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });
    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    const referralCode = await prisma.referralCode.findUnique({
        where: { ownerCustomerId: customer.id },
    });

    if (!referralCode) {
        return {
            data: [],
            meta: {
                page: Number(queryParams.page) || 1,
                limit: Number(queryParams.limit) || 10,
                total: 0,
                totalPages: 0,
            },
        };
    }

    const queryBuilder = new QueryBuilder(prisma.referralEvent, queryParams, {
        filterableFields: ["status"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .where({ referralCodeId: referralCode.id })
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    referredCustomer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    referredOrder: {
                        select: {
                            id: true,
                            orderNumber: true,
                            totalAmount: true,
                            status: true,
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

const getAllReferralEventsForAdmin = async (
    queryParams: IReferralEventQueryParams,
) => {
    const queryBuilder = new QueryBuilder(prisma.referralEvent, queryParams, {
        filterableFields: ["status"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    referralCode: true,
                    referredCustomer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    referredOrder: {
                        select: {
                            id: true,
                            orderNumber: true,
                            totalAmount: true,
                            status: true,
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

const overrideReferralStatus = async (
    payload: IOverrideReferralStatusPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existing = await prisma.referralEvent.findUnique({
        where: { id: payload.referralEventId },
    });

    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Referral event not found");
    }

    const statusMap = {
        PENDING: ReferralRewardStatus.PENDING,
        REWARDED: ReferralRewardStatus.REWARDED,
        REJECTED: ReferralRewardStatus.REJECTED,
    };

    const updated = await prisma.referralEvent.update({
        where: { id: existing.id },
        data: {
            status: statusMap[payload.status],
            rewardedAt:
                payload.status === "REWARDED"
                    ? new Date()
                    : existing.rewardedAt,
        },
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "CHANGE_STATUS",
        entityType: "ReferralEvent",
        entityId: existing.id,
        beforeState: existing,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

export const CustomerReferralService = {
    getOrCreateMyReferralCode,
    getMyReferralEvents,
    getAllReferralEventsForAdmin,
    overrideReferralStatus,
};
