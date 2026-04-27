import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { queueCloudinaryDeletion } from "./mediaCleanupQueue";
import { TPrismaTransactionClient } from "./mediaQueueTypes";

export const assertProductExists = async (productId: string) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product || product.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Product not found or is deleted");
    }

    return product;
};

export const queueProductMediaDeletionTask = async (
    mediaUrl: string,
    tx: TPrismaTransactionClient,
) => {
    await queueCloudinaryDeletion(tx, {
        url: mediaUrl,
        context: "ProductMedia",
    });
};

export const queueReviewMediaDeletionTasks = async (
    mediaUrls: string[],
    tx: TPrismaTransactionClient,
) => {
    await Promise.all(
        mediaUrls.map((mediaUrl) =>
            queueCloudinaryDeletion(tx, {
                url: mediaUrl,
                context: "ReviewMedia",
            }),
        ),
    );
};
