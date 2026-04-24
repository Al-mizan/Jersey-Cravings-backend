import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { IqueryParams } from "../../../interface/query.interface";
import { Prisma } from "../../../../generated/prisma/client";
import {
    ICreateCategoryPayload,
    IUpdateCategoryPayload,
    ICategoryQueryParams,
} from "./category.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { IAuditLog } from "../../../interface/logging.interface";

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

const createCategory = async (
    payload: ICreateCategoryPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    // Check if slug already exists
    const existingCategory = await prisma.category.findFirst({
        where: { slug: payload.slug },
    });

    if (existingCategory) {
        throw new AppError(
            status.CONFLICT,
            "Category with this slug already exists",
        );
    }

    const category = await prisma.category.create({
        data: {
            name: payload.name,
            slug: payload.slug,
            isActive: true,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "CREATE",
        entityType: "Category",
        entityId: category.id,
        beforeState: {},
        afterState: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            isActive: category.isActive,
        },
        ipAddress,
        userAgent,
    });

    return category;
};

const getAllCategories = async (queryParams: ICategoryQueryParams) => {
    const queryBuilder = new QueryBuilder(
        prisma.category,
        queryParams as unknown as IqueryParams,
        {
        searchableFields: ["name", "slug"],
        filterableFields: ["isActive", "isDeleted"],
        },
    );

    return await queryBuilder.search().filter().paginate().sort().execute();
};

const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            products: {
                where: { isDeleted: false },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                },
            },
        },
    });

    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    if (category.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Category has been deleted");
    }

    return category;
};

const updateCategory = async (
    id: string,
    payload: IUpdateCategoryPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    if (category.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Category has been deleted");
    }

    // Check if slug exists (if updating)
    if (payload.slug && payload.slug !== category.slug) {
        const existingCategory = await prisma.category.findFirst({
            where: { slug: payload.slug },
        });

        if (existingCategory) {
            throw new AppError(
                status.CONFLICT,
                "Category with this slug already exists",
            );
        }
    }

    const beforeState = { ...category };
    const updatedCategory = await prisma.category.update({
        where: { id },
        data: payload,
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "UPDATE",
        entityType: "Category",
        entityId: id,
        beforeState,
        afterState: updatedCategory,
        ipAddress,
        userAgent,
    });

    return updatedCategory;
};

const softDeleteCategory = async (
    id: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    if (category.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Category is already deleted");
    }

    const beforeState = { ...category };
    const deletedCategory = await prisma.category.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "SOFT_DELETE",
        entityType: "Category",
        entityId: id,
        beforeState,
        afterState: deletedCategory,
        ipAddress,
        userAgent,
    });

    return deletedCategory;
};

const restoreCategory = async (
    id: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    if (!category.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Category is not deleted");
    }

    const beforeState = { ...category };
    const restoredCategory = await prisma.category.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "RESTORE",
        entityType: "Category",
        entityId: id,
        beforeState,
        afterState: restoredCategory,
        ipAddress,
        userAgent,
    });

    return restoredCategory;
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    softDeleteCategory,
    restoreCategory,
};
