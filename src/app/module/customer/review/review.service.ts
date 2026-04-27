import status from "http-status";
import { Role } from "../../../../generated/prisma/client";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreateReviewPayload,
    IReviewQueryParams,
    IUpdateReviewPayload,
} from "./review.interface";
import { logAudit } from "../../../shared/logAudit";
import { queueReviewMediaDeletionTasks } from "../../../shared/collectionMediaService";

const giveReview = async (
    user: IRequestUser,
    payload: ICreateReviewPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const customer = await prisma.customer.findUnique({
        where: { userId: user.userId },
    });

    if (!customer || customer.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Customer profile not found");
    }

    const product = await prisma.product.findUnique({
        where: { id: payload.productId },
    });

    if (!product || product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product not found");
    }

    const existingReview = await prisma.review.findUnique({
        where: {
            productId_userId: {
                productId: payload.productId,
                userId: user.userId,
            },
        },
    });

    if (existingReview) {
        throw new AppError(
            status.CONFLICT,
            "You already reviewed this product",
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                userId: user.userId,
                customerId: customer.id,
                productId: payload.productId,
                rating: payload.rating,
                comment: payload.comment,
                isApproved: true,
            },
        });

        if (payload.medias && payload.medias.length > 0) {
            await tx.reviewMedia.createMany({
                data: payload.medias.map((media) => ({
                    reviewId: review.id,
                    publicId: media.publicId,
                    secureUrl: media.secureUrl,
                    resourceType: media.resourceType,
                })),
            });
        }

        return await tx.review.findUnique({
            where: { id: review.id },
            include: {
                reviewMedias: true,
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        });
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CREATE",
        entityType: "Review",
        entityId: result!.id,
        beforeState: {},
        afterState: result!,
        ipAddress,
        userAgent,
    });

    return result;
};

const getAllReviews = async (queryParams: IReviewQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.review, queryParams, {
        filterableFields: ["productId", "isApproved"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    reviewMedias: true,
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
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

const myReviews = async (
    user: IRequestUser,
    queryParams: IReviewQueryParams,
) => {
    const queryBuilder = new QueryBuilder(prisma.review, queryParams, {
        filterableFields: ["isApproved"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .where({ userId: user.userId })
            .filter()
            .paginate()
            .sort()
            .exec({
                include: {
                    reviewMedias: true,
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
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

const updateReview = async (
    user: IRequestUser,
    reviewId: string,
    payload: IUpdateReviewPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            reviewMedias: true,
        },
    });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (user.role === Role.CUSTOMER && review.userId !== user.userId) {
        throw new AppError(
            status.FORBIDDEN,
            "You can only update your own review",
        );
    }

    const updateData: IUpdateReviewPayload = { ...payload };
    const incomingMedias = payload.medias;
    delete updateData.medias;

    if (user.role === Role.CUSTOMER) {
        delete updateData.isApproved;
    }

    const updatedReview = await prisma.$transaction(async (tx) => {
        const updated = await tx.review.update({
            where: { id: reviewId },
            data: updateData,
            include: {
                reviewMedias: true,
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        });

        if (incomingMedias && incomingMedias.length > 0) {
            const existingMediaUrls = review.reviewMedias.map(
                (media) => media.secureUrl,
            );

            if (existingMediaUrls.length > 0) {
                await queueReviewMediaDeletionTasks(existingMediaUrls, tx);
            }

            await tx.reviewMedia.deleteMany({
                where: { reviewId },
            });

            await tx.reviewMedia.createMany({
                data: incomingMedias.map((media) => ({
                    reviewId,
                    publicId: media.publicId,
                    secureUrl: media.secureUrl,
                    resourceType: media.resourceType,
                })),
            });

            return tx.review.findUniqueOrThrow({
                where: { id: reviewId },
                include: {
                    reviewMedias: true,
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                },
            });
        }

        return updated;
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: user.role === Role.CUSTOMER ? "UPDATE" : "MODERATE",
        entityType: "Review",
        entityId: review.id,
        beforeState: review,
        afterState: updatedReview,
        ipAddress,
        userAgent,
    });

    return updatedReview;
};

const deleteReview = async (
    user: IRequestUser,
    reviewId: string,
    ipAddress?: string,
    userAgent?: string,
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            reviewMedias: true,
        },
    });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (user.role === Role.CUSTOMER && review.userId !== user.userId) {
        throw new AppError(
            status.FORBIDDEN,
            "You can only delete your own review",
        );
    }

    await prisma.$transaction(async (tx) => {
        const mediaUrls = review.reviewMedias.map((media) => media.secureUrl);
        if (mediaUrls.length > 0) {
            await queueReviewMediaDeletionTasks(mediaUrls, tx);
        }

        await tx.review.delete({
            where: { id: reviewId },
        });
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "DELETE",
        entityType: "Review",
        entityId: review.id,
        beforeState: review,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return { success: true };
};

const moderateReview = async (
    reviewId: string,
    isApproved: boolean,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { isApproved },
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "MODERATE",
        entityType: "Review",
        entityId: review.id,
        beforeState: review,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

export const ReviewService = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview,
    moderateReview,
};
