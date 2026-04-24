import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreateProductVariantPayload,
    IUpdateProductVariantPayload,
    IProductVariantQueryParams,
} from "./product-variant.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { IAuditLog } from "../../../interface/logging.interface";
import { Prisma } from "../../../../generated/prisma/client";

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

const createProductVariant = async (
    productId: string,
    payload: ICreateProductVariantPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    // Verify product exists and is not deleted
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product || product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product not found or is deleted");
    }

    // Check if SKU already exists for this product
    const existingVariant = await prisma.productVariant.findFirst({
        where: {
            productId,
            sku: payload.sku,
        },
    });

    if (existingVariant) {
        throw new AppError(
            status.CONFLICT,
            "Variant with this SKU already exists for this product",
        );
    }

    // Validate price constraints
    if (
        payload.compareAtAmount &&
        payload.compareAtAmount <= payload.priceAmount
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "Compare at price must be greater than sale price",
        );
    }

    const variant = await prisma.productVariant.create({
        data: {
            productId,
            sku: payload.sku,
            size: payload.size,
            fit: payload.fit,
            sleeveType: payload.sleeveType,
            priceAmount: payload.priceAmount,
            compareAtAmount: payload.compareAtAmount,
            costAmount: payload.costAmount,
            stockQty: payload.stockQty,
            reservedQty: 0,
            isActive: true,
        },
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CREATE",
        entityType: "ProductVariant",
        entityId: variant.id,
        beforeState: {},
        afterState: {
            id: variant.id,
            sku: variant.sku,
            priceAmount: variant.priceAmount,
            stockQty: variant.stockQty,
        },
        ipAddress,
        userAgent,
    });

    return variant;
};

const getProductVariants = async (
    productId: string,
    queryParams: Partial<IProductVariantQueryParams>,
) => {
    // Verify product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product || product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product not found or is deleted");
    }

    const queryBuilder = new QueryBuilder(
        prisma.productVariant,
        { ...queryParams, productId },
        {
            filterableFields: ["isActive"],
        },
    );

    const [data, total] = await Promise.all([
        queryBuilder.filter().paginate().sort().exec(),
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

const getVariantById = async (productId: string, variantId: string) => {
    // Verify product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product || product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product not found or is deleted");
    }

    const variant = await prisma.productVariant.findFirst({
        where: {
            id: variantId,
            productId,
        },
    });

    if (!variant) {
        throw new AppError(status.NOT_FOUND, "Variant not found");
    }

    return variant;
};

const updateVariant = async (
    productId: string,
    variantId: string,
    payload: IUpdateProductVariantPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const variant = await getVariantById(productId, variantId);

    // Validate price constraints if updating prices
    if (payload.compareAtAmount || payload.priceAmount) {
        const newPrice = payload.priceAmount || variant.priceAmount;
        const newCompareAt = payload.compareAtAmount || variant.compareAtAmount;

        if (newCompareAt && newCompareAt <= newPrice) {
            throw new AppError(
                status.BAD_REQUEST,
                "Compare at price must be greater than sale price",
            );
        }
    }

    const beforeState = { ...variant };
    const updatedVariant = await prisma.productVariant.update({
        where: { id: variantId },
        data: payload,
    });

    // Audit log if price or stock changed
    if (payload.priceAmount || payload.stockQty) {
        await logAudit({
            actorRole: user.role,
            actorUserId: user.userId,
            action: payload.priceAmount ? "UPDATE_PRICE" : "UPDATE_STOCK",
            entityType: "ProductVariant",
            entityId: variantId,
            beforeState,
            afterState: updatedVariant,
            ipAddress,
            userAgent,
        });
    }

    return updatedVariant;
};

const deleteVariant = async (
    productId: string,
    variantId: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const variant = await getVariantById(productId, variantId);

    // Check if variant has any order items
    const orderItems = await prisma.orderItem.count({
        where: { variantId },
    });

    if (orderItems > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Cannot delete variant that has been ordered",
        );
    }

    const beforeState = { ...variant };
    await prisma.productVariant.delete({
        where: { id: variantId },
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "DELETE",
        entityType: "ProductVariant",
        entityId: variantId,
        beforeState,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return { success: true };
};

export const ProductVariantService = {
    createProductVariant,
    getProductVariants,
    getVariantById,
    updateVariant,
    deleteVariant,
};
