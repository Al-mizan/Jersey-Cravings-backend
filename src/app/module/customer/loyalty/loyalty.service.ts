import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    IPointTransactionQueryParams,
    IUpdateLoyaltySettingPayload,
} from "./loyalty.interface";
import { logAudit } from "../../../shared/logAudit";



const getMyLoyaltySummary = async (user: IRequestUser) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });
    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    const activeSetting = await prisma.loyaltySetting.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
    });

    return {
        customerId: customer.id,
        points: customer.points,
        lifetimePointsEarned: customer.lifetimePointsEarned,
        lifetimePointsRedeemed: customer.lifetimePointsRedeemed,
        totalPurchasedQty: customer.totalPurchasedQty,
        activeSetting,
    };
};

const getMyPointTransactions = async (
    user: IRequestUser,
    queryParams: IPointTransactionQueryParams,
) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });
    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    const queryBuilder = new QueryBuilder(
        prisma.pointTransaction,
        queryParams,
        { filterableFields: ["type"] },
    );

    const [data, total] = await Promise.all([
        queryBuilder
            .where({ customerId: customer.id })
            .filter()
            .paginate()
            .sort()
            .exec(),
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

const getCustomerLoyaltyByAdmin = async (customerId: string) => {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            pointTransactions: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    if (!customer) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    return customer;
};

const getActiveLoyaltySetting = async () => {
    return await prisma.loyaltySetting.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
    });
};

const updateLoyaltySetting = async (
    payload: IUpdateLoyaltySettingPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const current = await prisma.loyaltySetting.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
    });

    if (!current) {
        throw new AppError(status.NOT_FOUND, "Loyalty setting not found");
    }

    const updated = await prisma.loyaltySetting.update({
        where: { id: current.id },
        data: payload,
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "UPDATE",
        entityType: "LoyaltySetting",
        entityId: current.id,
        beforeState: current,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

export const CustomerLoyaltyService = {
    getMyLoyaltySummary,
    getMyPointTransactions,
    getCustomerLoyaltyByAdmin,
    getActiveLoyaltySetting,
    updateLoyaltySetting,
};
