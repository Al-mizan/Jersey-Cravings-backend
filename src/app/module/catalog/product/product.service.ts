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

const publishProduct = async (
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
        throw new AppError(status.NOT_FOUND, "Product has been deleted");
    }

    if (product.status !== ProductStatus.DRAFT) {
        throw new AppError(
            status.BAD_REQUEST,
            "Only DRAFT products can be published",
        );
    }

    // Verify product has at least one variant
    const variantCount = await prisma.productVariant.count({
        where: { productId: id },
    });

    if (variantCount === 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Product must have at least one variant before publishing",
        );
    }

    const beforeState = { ...product };
    const publishedProduct = await prisma.product.update({
        where: { id },
        data: { status: ProductStatus.ACTIVE },
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
        action: "PUBLISH",
        entityType: "Product",
        entityId: id,
        beforeState: { ...beforeState, status: product.status },
        afterState: { ...publishedProduct, status: ProductStatus.ACTIVE },
        ipAddress,
        userAgent,
    });

    return publishedProduct;
};

const archiveProduct = async (
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
        throw new AppError(status.NOT_FOUND, "Product has been deleted");
    }

    if (product.status === ProductStatus.ARCHIVED) {
        throw new AppError(status.BAD_REQUEST, "Product is already archived");
    }

    const beforeState = { ...product };
    const archivedProduct = await prisma.product.update({
        where: { id },
        data: { status: ProductStatus.ARCHIVED },
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
        action: "ARCHIVE",
        entityType: "Product",
        entityId: id,
        beforeState,
        afterState: { ...archivedProduct, status: ProductStatus.ARCHIVED },
        ipAddress,
        userAgent,
    });

    return archivedProduct;
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
    publishProduct,
    archiveProduct,
    softDeleteProduct,
    restoreProduct,
};
