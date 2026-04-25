/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../../lib/prisma";
import { IRequestUser } from "../../../interface/requestUser.interface";
import {
    IBulkPublishPayload,
    IBulkArchivePayload,
    IBulkCategoryTogglePayload,
    IBulkCouponTogglePayload,
    IBulkActionResult,
} from "./bulk-action.interface";
import { ProductStatus } from "../../../../generated/prisma/enums";
import { logAudit } from "../../../shared/logAudit";


const bulkPublishProducts = async (
    payload: IBulkPublishPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
): Promise<IBulkActionResult> => {
    const result: IBulkActionResult = {
        total: payload.productIds.length,
        successful: 0,
        failed: 0,
        errors: [],
    };

    for (const productId of payload.productIds) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product || product.isDeleted) {
                result.failed++;
                result.errors.push({
                    id: productId,
                    error: "Product not found or deleted",
                });
                continue;
            }

            if (product.status !== ProductStatus.DRAFT) {
                result.failed++;
                result.errors.push({
                    id: productId,
                    error: "Product must be in DRAFT status to publish",
                });
                continue;
            }

            const beforeState = { ...product };
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: { status: ProductStatus.ACTIVE },
            });

            await logAudit({
                actorRole: user.role,
                actorUserId: user.userId,
                action: "BULK_PUBLISH",
                entityType: "Product",
                entityId: productId,
                beforeState,
                afterState: updatedProduct,
                ipAddress,
                userAgent,
            });

            result.successful++;
        } catch (error: any) {
            result.failed++;
            result.errors.push({
                id: productId,
                error: error.message || "Unknown error",
            });
        }
    }

    return result;
};

const bulkArchiveProducts = async (
    payload: IBulkArchivePayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
): Promise<IBulkActionResult> => {
    const result: IBulkActionResult = {
        total: payload.productIds.length,
        successful: 0,
        failed: 0,
        errors: [],
    };

    for (const productId of payload.productIds) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product || product.isDeleted) {
                result.failed++;
                result.errors.push({
                    id: productId,
                    error: "Product not found or deleted",
                });
                continue;
            }

            if (product.status === ProductStatus.ARCHIVED) {
                result.failed++;
                result.errors.push({
                    id: productId,
                    error: "Product is already archived",
                });
                continue;
            }

            const beforeState = { ...product };
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: { status: ProductStatus.ARCHIVED },
            });

            await logAudit({
                actorRole: user.role,
                actorUserId: user.userId,
                action: "BULK_ARCHIVE",
                entityType: "Product",
                entityId: productId,
                beforeState,
                afterState: updatedProduct,
                ipAddress,
                userAgent,
            });

            result.successful++;
        } catch (error: any) {
            result.failed++;
            result.errors.push({
                id: productId,
                error: error.message || "Unknown error",
            });
        }
    }

    return result;
};

const bulkToggleCategories = async (
    payload: IBulkCategoryTogglePayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
): Promise<IBulkActionResult> => {
    const result: IBulkActionResult = {
        total: payload.categoryIds.length,
        successful: 0,
        failed: 0,
        errors: [],
    };

    for (const categoryId of payload.categoryIds) {
        try {
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
            });

            if (!category || category.isDeleted) {
                result.failed++;
                result.errors.push({
                    id: categoryId,
                    error: "Category not found or deleted",
                });
                continue;
            }

            const beforeState = { ...category };
            const updatedCategory = await prisma.category.update({
                where: { id: categoryId },
                data: { isActive: payload.isActive },
            });

            await logAudit({
                actorRole: user.role,
                actorUserId: user.userId,
                action: `BULK_${payload.isActive ? "ACTIVATE" : "DEACTIVATE"}`,
                entityType: "Category",
                entityId: categoryId,
                beforeState,
                afterState: updatedCategory,
                ipAddress,
                userAgent,
            });

            result.successful++;
        } catch (error: any) {
            result.failed++;
            result.errors.push({
                id: categoryId,
                error: error.message || "Unknown error",
            });
        }
    }

    return result;
};

const bulkToggleCoupons = async (
    payload: IBulkCouponTogglePayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
): Promise<IBulkActionResult> => {
    const result: IBulkActionResult = {
        total: payload.couponIds.length,
        successful: 0,
        failed: 0,
        errors: [],
    };

    for (const couponId of payload.couponIds) {
        try {
            const coupon = await prisma.coupon.findUnique({
                where: { id: couponId },
            });

            if (!coupon || coupon.isDeleted) {
                result.failed++;
                result.errors.push({
                    id: couponId,
                    error: "Coupon not found or deleted",
                });
                continue;
            }

            const beforeState = { ...coupon };
            const updatedCoupon = await prisma.coupon.update({
                where: { id: couponId },
                data: { isActive: payload.isActive },
            });

            await logAudit({
                actorRole: user.role,
                actorUserId: user.userId,
                action: `BULK_${payload.isActive ? "ACTIVATE" : "DEACTIVATE"}`,
                entityType: "Coupon",
                entityId: couponId,
                beforeState,
                afterState: updatedCoupon,
                ipAddress,
                userAgent,
            });

            result.successful++;
        } catch (error: any) {
            result.failed++;
            result.errors.push({
                id: couponId,
                error: error.message || "Unknown error",
            });
        }
    }

    return result;
};

export const BulkActionService = {
    bulkPublishProducts,
    bulkArchiveProducts,
    bulkToggleCategories,
    bulkToggleCoupons,
};
