import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreateProductMediaPayload,
    IProductMediaQueryParams,
} from "./product-media.interface";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { logAudit } from "../../../shared/logAudit";
import {
    assertProductExists,
    queueProductMediaDeletionTask,
} from "../../../shared/collectionMediaService";

const createProductMedia = async (
    productId: string,
    payload: ICreateProductMediaPayload,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    await assertProductExists(productId);

    // Get max sort order
    const maxMedia = await prisma.productMedia.findFirst({
        where: { productId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    const nextSortOrder = (maxMedia?.sortOrder || 0) + 1;

    const media = await prisma.productMedia.create({
        data: {
            productId,
            publicId: payload.publicId,
            secureUrl: payload.secureUrl,
            resourceType: payload.resourceType,
            altText: payload.altText,
            sortOrder: nextSortOrder,
        },
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CREATE",
        entityType: "ProductMedia",
        entityId: media.id,
        beforeState: {},
        afterState: {
            id: media.id,
            productId,
            resourceType: media.resourceType,
        },
        ipAddress,
        userAgent,
    });

    return media;
};

const getProductMedia = async (
    productId: string,
    queryParams: Partial<IProductMediaQueryParams>,
) => {
    await assertProductExists(productId);

    const queryBuilder = new QueryBuilder(prisma.productMedia, {
        ...queryParams,
        productId,
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .paginate()
            .sort()
            .exec({
                orderBy: { sortOrder: "asc" },
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

const getMediaById = async (productId: string, mediaId: string) => {
    await assertProductExists(productId);

    const media = await prisma.productMedia.findFirst({
        where: {
            id: mediaId,
            productId,
        },
    });

    if (!media) {
        throw new AppError(status.NOT_FOUND, "Media not found");
    }

    return media;
};

const updateMedia = async (
    productId: string,
    mediaId: string,
    payload: Partial<ICreateProductMediaPayload>,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const media = await getMediaById(productId, mediaId);

    const beforeState = { ...media };
    const updatedMedia = await prisma.$transaction(async (tx) => {
        const updatePayload = {
            altText:
                payload.altText !== undefined ? payload.altText : media.altText,
            secureUrl: payload.secureUrl || media.secureUrl,
            publicId: payload.publicId || media.publicId,
            resourceType: payload.resourceType || media.resourceType,
        };

        if (payload.secureUrl && payload.secureUrl !== media.secureUrl) {
            await queueProductMediaDeletionTask(media.secureUrl, tx);
        }

        return tx.productMedia.update({
            where: { id: mediaId },
            data: updatePayload,
        });
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "UPDATE",
        entityType: "ProductMedia",
        entityId: mediaId,
        beforeState,
        afterState: updatedMedia,
        ipAddress,
        userAgent,
    });

    return updatedMedia;
};

const reorderMedia = async (
    productId: string,
    mediaOrder: Array<{ id: string; sortOrder: number }>,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    await assertProductExists(productId);

    // Verify all media items exist for this product
    const mediaIds = mediaOrder.map((m) => m.id);
    const existingMedia = await prisma.productMedia.findMany({
        where: {
            id: { in: mediaIds },
            productId,
        },
    });

    if (existingMedia.length !== mediaIds.length) {
        throw new AppError(
            status.BAD_REQUEST,
            "Some media items do not exist for this product",
        );
    }

    // Update sort orders in transaction
    const beforeState = existingMedia;
    await prisma.$transaction(
        mediaOrder.map((item) =>
            prisma.productMedia.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            }),
        ),
    );

    const afterState = await prisma.productMedia.findMany({
        where: { productId },
        orderBy: { sortOrder: "asc" },
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "REORDER",
        entityType: "ProductMedia",
        entityId: productId,
        beforeState: {
            items: beforeState.map((m) => ({
                id: m.id,
                sortOrder: m.sortOrder,
            })),
        },
        afterState: { items: mediaOrder },
        ipAddress,
        userAgent,
    });

    return afterState;
};

const deleteMedia = async (
    productId: string,
    mediaId: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const media = await getMediaById(productId, mediaId);

    const beforeState = { ...media };
    await prisma.$transaction(async (tx) => {
        await queueProductMediaDeletionTask(media.secureUrl, tx);
        await tx.productMedia.delete({
            where: { id: mediaId },
        });
    });

    // Audit log
    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "DELETE",
        entityType: "ProductMedia",
        entityId: mediaId,
        beforeState,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return { success: true };
};

export const ProductMediaService = {
    createProductMedia,
    getProductMedia,
    getMediaById,
    updateMedia,
    reorderMedia,
    deleteMedia,
};
