import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreateProductPayload,
    IUpdateProductPayload,
    IProductQueryParams,
} from "./product.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { ProductStatus } from "../../../../generated/prisma/enums";
import { logAudit } from "../../../shared/logAudit";
import { isValidStatusTransition } from "./product.utils";

const createProduct = async (
    payload: ICreateProductPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    // Verify category exists and is not deleted
    const category = await prisma.category.findUnique({
        where: { id: payload.categoryId },
    });

    if (!category || category.isDeleted) {
        throw new AppError(
            status.NOT_FOUND,
            "Category not found or is deleted",
        );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findFirst({
        where: { slug: payload.slug },
    });

    if (existingProduct) {
        throw new AppError(
            status.CONFLICT,
            "Product with this slug already exists",
        );
    }

    const product = await prisma.product.create({
        data: {
            ...payload,
            status: ProductStatus.DRAFT,
            createdById: user.userId,
        },
        include: {
            category: true,
            variants: true,
            media: true,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "CREATE",
        entityType: "Product",
        entityId: product.id,
        beforeState: {},
        afterState: {
            id: product.id,
            title: product.title,
            status: product.status,
        },
        ipAddress,
        userAgent,
    });

    return product;
};

const getAllProducts = async (queryParams: IProductQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.product, queryParams, {
        searchableFields: ["title", "teamName", "tournamentTag"],
        filterableFields: ["status", "categoryId", "isDeleted"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .search()
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    category: true,
                    variants: { where: { isActive: true } },
                    media: { orderBy: { sortOrder: "asc" } },
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

const getProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            variants: true,
            media: { orderBy: { sortOrder: "asc" } },
        },
    });

    if (!product) {
        throw new AppError(status.NOT_FOUND, "Product not found");
    }

    if (product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product has been deleted");
    }

    return product;
};

const updateProduct = async (
    id: string,
    payload: IUpdateProductPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        throw new AppError(status.NOT_FOUND, "Product not found");
    }

    if (product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product has been deleted");
    }

    // Only allow updates in DRAFT status
    if (product.status !== ProductStatus.DRAFT) {
        throw new AppError(
            status.BAD_REQUEST,
            "Product can only be updated in DRAFT status",
        );
    }

    // Verify category if updating
    if (payload.categoryId && payload.categoryId !== product.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: payload.categoryId },
        });

        if (!category || category.isDeleted) {
            throw new AppError(
                status.NOT_FOUND,
                "Category not found or is deleted",
            );
        }
    }

    // Check if slug exists (if updating)
    if (payload.slug && payload.slug !== product.slug) {
        const existingProduct = await prisma.product.findFirst({
            where: { slug: payload.slug },
        });

        if (existingProduct) {
            throw new AppError(
                status.CONFLICT,
                "Product with this slug already exists",
            );
        }
    }

    const beforeState = { ...product };
    const updatedProduct = await prisma.product.update({
        where: { id },
        data: payload,
        include: {
            category: true,
            variants: true,
            media: true,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "UPDATE",
        entityType: "Product",
        entityId: id,
        beforeState,
        afterState: updatedProduct,
        ipAddress,
        userAgent,
    });

    return updatedProduct;
};

const updateProductStatus = async (
    productId: string,
    newStatus: ProductStatus,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new AppError(status.NOT_FOUND, "Product not found");
    }

    if (product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product has been deleted");
    }

    if (product.status === newStatus) {
        throw new AppError(
            status.BAD_REQUEST,
            `Product is already ${newStatus}`,
        );
    }

    if (!isValidStatusTransition(product.status, newStatus)) {
        throw new AppError(
            status.BAD_REQUEST,
            `Product cannot be moved from ${product.status} to ${newStatus}`,
        );
    }

    if (newStatus === ProductStatus.ACTIVE) {
        const variantCount = await prisma.productVariant.count({
            where: { productId },
        });

        if (variantCount === 0) {
            throw new AppError(
                status.BAD_REQUEST,
                "Product must have at least one variant before setting ACTIVE",
            );
        }
    }

    const beforeState = { ...product };
    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { status: newStatus },
        include: {
            category: true,
            variants: true,
            media: true,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: newStatus === ProductStatus.ACTIVE ? "PUBLISH" : "ARCHIVE",
        entityType: "Product",
        entityId: productId,
        beforeState,
        afterState: { ...updatedProduct, status: newStatus },
        ipAddress,
        userAgent,
    });

    return updatedProduct;
};

const softDeleteProduct = async (
    id: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        throw new AppError(status.NOT_FOUND, "Product not found");
    }

    if (product.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Product is already deleted");
    }

    const beforeState = { ...product };
    const deletedProduct = await prisma.product.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
        include: {
            category: true,
            variants: true,
            media: true,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "SOFT_DELETE",
        entityType: "Product",
        entityId: id,
        beforeState,
        afterState: {
            ...deletedProduct,
            isDeleted: true,
            deletedAt: new Date(),
        },
        ipAddress,
        userAgent,
    });

    return deletedProduct;
};

const restoreProduct = async (
    id: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        throw new AppError(status.NOT_FOUND, "Product not found");
    }

    if (!product.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Product is not deleted");
    }

    const beforeState = { ...product };
    const restoredProduct = await prisma.product.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
        include: {
            category: true,
            variants: true,
            media: true,
        },
    });

    // Audit log
    await logAudit({
        actorUserId: user.userId,
        actorRole: user.role,
        action: "RESTORE",
        entityType: "Product",
        entityId: id,
        beforeState,
        afterState: { ...restoredProduct, isDeleted: false, deletedAt: null },
        ipAddress,
        userAgent,
    });

    return restoredProduct;
};

export const ProductService = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    softDeleteProduct,
    restoreProduct,
};
