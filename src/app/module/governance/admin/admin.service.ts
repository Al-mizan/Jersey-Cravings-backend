/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreateAdminPayload,
    IUpdateAdminPayload,
    IChangeUserStatusPayload,
    IChangeUserRolePayload,
    IAdminQueryParams,
} from "./admin.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { Role, UserStatus } from "../../../../generated/prisma/client";
import { auth } from "../../../lib/auth";
import { logAudit } from "../../../shared/logAudit";
import { queueSingleMediaReplacementCleanup } from "../../../shared/singleFieldMediaService";
import { logger } from "../../../lib/logger";

const createAdmin = async (
    payload: ICreateAdminPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    if (user.role !== Role.SUPER_ADMIN) {
        throw new AppError(
            status.FORBIDDEN,
            "Only SUPER_ADMIN can create admin users",
        );
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: payload.admin.email },
    });

    if (existingUser) {
        throw new AppError(
            status.CONFLICT,
            "User with this email already exists",
        );
    }

    const userData = await auth.api.signUpEmail({
        body: {
            ...payload.admin,
            password: payload.password,
            role: payload.role,
            needPasswordChange: true,
        },
    });

    try {
        const adminData = await prisma.admin.create({
            data: {
                userId: userData.user.id,
                ...payload.admin,
            },
            include: {
                user: true,
            },
        });

        await logAudit({
            actorRole: user.role,
            actorUserId: user.userId,
            action: "CREATE",
            entityType: "Admin",
            entityId: adminData.id,
            beforeState: {},
            afterState: adminData,
            ipAddress,
            userAgent,
        });

        return adminData;
    } catch (error: any) {
        logger.error("Error creating admin profile after auth signup", {
            userId: userData.user.id,
            error,
        });
        await prisma.user.delete({
            where: {
                id: userData.user.id,
            },
        });
        throw error;
    }
};

const getAllAdmins = async (queryParams: IAdminQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.admin, queryParams, {
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
                            role: true,
                            status: true,
                            createdAt: true,
                            updatedAt: true,
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

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    if (!admin) {
        throw new AppError(status.NOT_FOUND, "Admin not found");
    }

    if (admin.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Admin has been deleted");
    }

    return admin;
};

const updateAdmin = async (
    id: string,
    payload: IUpdateAdminPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const admin = await prisma.admin.findUnique({
        where: { id },
    });

    if (!admin) {
        throw new AppError(status.NOT_FOUND, "Admin not found");
    }

    if (admin.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Admin has been deleted");
    }

    // ADMIN can only update own profile
    if (user.role === Role.ADMIN && admin.userId !== user.userId) {
        throw new AppError(
            status.FORBIDDEN,
            "You can only update your own profile",
        );
    }

    const beforeState = { ...admin };
    const updatedAdmin = await prisma.$transaction(async (tx) => {
        await queueSingleMediaReplacementCleanup({
            tx,
            oldUrl: admin.profilePhoto,
            newUrl: payload.profilePhoto,
            context: "AdminProfile",
        });

        return tx.admin.update({
            where: { id },
            data: payload,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "UPDATE",
        entityType: "Admin",
        entityId: id,
        beforeState,
        afterState: updatedAdmin,
        ipAddress,
        userAgent,
    });

    return updatedAdmin;
};

const deleteAdmin = async (
    id: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const admin = await prisma.admin.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!admin) {
        throw new AppError(status.NOT_FOUND, "Admin not found");
    }

    if (admin.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Admin is already deleted");
    }

    // Self-protection: cannot delete self
    if (admin.userId === user.userId) {
        throw new AppError(
            status.BAD_REQUEST,
            "You cannot delete your own account",
        );
    }

    // ADMIN cannot delete ADMIN or SUPER_ADMIN
    if (user.role === Role.ADMIN) {
        throw new AppError(
            status.FORBIDDEN,
            "Only SUPER_ADMIN can delete admin users",
        );
    }

    // SUPER_ADMIN cannot delete another SUPER_ADMIN
    if (admin.user.role === Role.SUPER_ADMIN && user.userId !== admin.userId) {
        throw new AppError(
            status.FORBIDDEN,
            "SUPER_ADMIN users cannot be deleted",
        );
    }

    const beforeState = { ...admin, user: admin.user };

    // Soft delete both admin and user
    const [deletedAdmin, deletedUser] = await prisma.$transaction([
        prisma.admin.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
            include: { user: true },
        }),
        prisma.user.update({
            where: { id: admin.userId },
            data: { isDeleted: true, status: UserStatus.DELETED },
        }),
    ]);

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "SOFT_DELETE",
        entityType: "Admin",
        entityId: id,
        beforeState,
        afterState: { ...deletedAdmin, user: deletedUser },
        ipAddress,
        userAgent,
    });

    return { success: true };
};

const changeUserStatus = async (
    payload: IChangeUserStatusPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const targetUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { admin: true, customerProfile: true },
    });

    if (!targetUser) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    // Self-protection: cannot block/delete self
    if (
        targetUser.id === user.userId &&
        (payload.status === "BLOCKED" || payload.status === "DELETED")
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            `You cannot ${payload.status.toLowerCase()} your own account`,
        );
    }

    // ADMIN can only change CUSTOMER status (not ADMIN/SUPER_ADMIN)
    if (
        user.role === Role.ADMIN &&
        (targetUser.role === Role.ADMIN || targetUser.role === Role.SUPER_ADMIN)
    ) {
        throw new AppError(
            status.FORBIDDEN,
            "ADMIN cannot change status of other admin users",
        );
    }

    const statusMap = {
        ACTIVE: UserStatus.ACTIVE,
        BLOCKED: UserStatus.BLOCKED,
        DELETED: UserStatus.DELETED,
    };

    const beforeState = { ...targetUser, status: targetUser.status };
    const updatedUser = await prisma.user.update({
        where: { id: payload.userId },
        data: { status: statusMap[payload.status as keyof typeof statusMap] },
        include: { admin: true, customerProfile: true },
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CHANGE_STATUS",
        entityType: "User",
        entityId: targetUser.id,
        beforeState,
        afterState: { ...updatedUser, status: payload.status },
        ipAddress,
        userAgent,
    });

    return updatedUser;
};

const changeUserRole = async (
    payload: IChangeUserRolePayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    // Only SUPER_ADMIN can change roles
    if (user.role !== Role.SUPER_ADMIN) {
        throw new AppError(
            status.FORBIDDEN,
            "Only SUPER_ADMIN can change user roles",
        );
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { admin: true },
    });

    if (!targetUser) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    // Self-protection: cannot demote self
    if (targetUser.id === user.userId && payload.role !== "SUPER_ADMIN") {
        throw new AppError(
            status.BAD_REQUEST,
            "You cannot demote your own role",
        );
    }

    // Can only change between ADMIN and SUPER_ADMIN
    if (targetUser.role === Role.CUSTOMER) {
        throw new AppError(
            status.BAD_REQUEST,
            "Customer users cannot be promoted to admin roles",
        );
    }

    const roleMap = {
        ADMIN: Role.ADMIN,
        SUPER_ADMIN: Role.SUPER_ADMIN,
    };

    const beforeState = { ...targetUser, role: targetUser.role };
    const updatedUser = await prisma.user.update({
        where: { id: payload.userId },
        data: { role: roleMap[payload.role as keyof typeof roleMap] },
        include: { admin: true },
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CHANGE_ROLE",
        entityType: "User",
        entityId: targetUser.id,
        beforeState,
        afterState: { ...updatedUser, role: payload.role },
        ipAddress,
        userAgent,
    });

    return updatedUser;
};

export const AdminService = {
    createAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole,
};
