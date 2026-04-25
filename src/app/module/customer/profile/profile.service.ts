import status from "http-status";
import { UserStatus } from "../../../../generated/prisma/client";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    IChangeCustomerStatusPayload,
    ICustomerQueryParams,
    IUpdateMyProfilePayload,
} from "./profile.interface";
import { logAudit } from "../../../shared/logAudit";


const getMyProfile = async (user: IRequestUser) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer profile not found");
    }

    return customer;
};

const updateMyProfile = async (
    user: IRequestUser,
    payload: IUpdateMyProfilePayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });

    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer profile not found");
    }

    const beforeState = { ...customer };
    const updatedCustomer = await prisma.customer.update({
        where: { userId: user.userId },
        data: payload,
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "UPDATE_PROFILE",
        entityType: "Customer",
        entityId: updatedCustomer.id,
        beforeState,
        afterState: updatedCustomer,
        ipAddress,
        userAgent,
    });

    return updatedCustomer;
};

const getAllCustomers = async (queryParams: ICustomerQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.customer, queryParams, {
        searchableFields: ["name", "email", "contactNumber"],
        filterableFields: ["isDeleted"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .search()
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            status: true,
                            role: true,
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

const getCustomerById = async (customerId: string) => {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    status: true,
                    role: true,
                },
            },
        },
    });

    if (!customer) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    return customer;
};

const changeCustomerStatus = async (
    payload: IChangeCustomerStatusPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const customer = await prisma.customer.findUnique({
        where: { id: payload.customerId },
        include: { user: true },
    });

    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    if (customer.userId === actor.userId && payload.status !== "ACTIVE") {
        throw new AppError(
            status.BAD_REQUEST,
            "You cannot block/delete your own account",
        );
    }

    const statusMap = {
        ACTIVE: UserStatus.ACTIVE,
        BLOCKED: UserStatus.BLOCKED,
        DELETED: UserStatus.DELETED,
    };

    const beforeState = { ...customer, userStatus: customer.user.status };

    const [updatedCustomer, updatedUser] = await prisma.$transaction([
        prisma.customer.update({
            where: { id: payload.customerId },
            data: {
                isDeleted:
                    payload.status === "DELETED" ? true : customer.isDeleted,
                deletedAt: payload.status === "DELETED" ? new Date() : null,
            },
        }),
        prisma.user.update({
            where: { id: customer.userId },
            data: {
                status: statusMap[payload.status],
                isDeleted:
                    payload.status === "DELETED"
                        ? true
                        : customer.user.isDeleted,
                deletedAt: payload.status === "DELETED" ? new Date() : null,
            },
        }),
    ]);

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "CHANGE_STATUS",
        entityType: "Customer",
        entityId: customer.id,
        beforeState,
        afterState: { ...updatedCustomer, userStatus: updatedUser.status },
        ipAddress,
        userAgent,
    });

    return { customer: updatedCustomer, user: updatedUser };
};

const restoreCustomer = async (
    customerId: string,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { user: true },
    });

    if (!customer) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    if (!customer.isDeleted && customer.user.status !== UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "Customer is not deleted");
    }

    const beforeState = { ...customer, userStatus: customer.user.status };

    const [restoredCustomer, restoredUser] = await prisma.$transaction([
        prisma.customer.update({
            where: { id: customerId },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        }),
        prisma.user.update({
            where: { id: customer.userId },
            data: {
                status: UserStatus.ACTIVE,
                isDeleted: false,
                deletedAt: null,
            },
        }),
    ]);

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "RESTORE",
        entityType: "Customer",
        entityId: customer.id,
        beforeState,
        afterState: { ...restoredCustomer, userStatus: restoredUser.status },
        ipAddress,
        userAgent,
    });

    return { customer: restoredCustomer, user: restoredUser };
};

export const CustomerProfileService = {
    getMyProfile,
    updateMyProfile,
    getAllCustomers,
    getCustomerById,
    changeCustomerStatus,
    restoreCustomer,
};
