import {
    deleteFileFromCloudinary,
    extractPublicIdFromCloudinaryUrl,
} from "../config/cloudinary.config";
import { prisma } from "../lib/prisma";
import { IMediaCleanupTaskInput, MEDIA_CLEANUP_STATUS } from "./mediaStrategy";
import { TPrismaOrTxClient } from "./mediaQueueTypes";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BATCH_SIZE = 20;

export const queueCloudinaryDeletion = async (
    db: TPrismaOrTxClient,
    input: IMediaCleanupTaskInput,
) => {
    const publicId = extractPublicIdFromCloudinaryUrl(input.url);

    if (!publicId) {
        return null;
    }

    return db.cloudinaryCleanupTask.create({
        data: {
            publicId,
            url: input.url,
            context: input.context,
            maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
            scheduledAt: input.scheduledAt ?? new Date(),
            status: MEDIA_CLEANUP_STATUS.PENDING,
        },
    });
};

export const queueManyCloudinaryDeletions = async (
    db: TPrismaOrTxClient,
    urls: string[],
    context?: string,
) => {
    const queuedTasks = await Promise.all(
        urls.map((url) =>
            queueCloudinaryDeletion(db, {
                url,
                context,
            }),
        ),
    );

    return queuedTasks.filter(Boolean);
};

const getRetryDelayInMs = (attempts: number) => {
    const baseDelayMs = 60 * 1000;
    return Math.pow(2, attempts) * baseDelayMs;
};

export const processCloudinaryCleanupQueue = async (
    batchSize = DEFAULT_BATCH_SIZE,
) => {
    const tasks = await prisma.cloudinaryCleanupTask.findMany({
        where: {
            status: MEDIA_CLEANUP_STATUS.PENDING,
            scheduledAt: { lte: new Date() },
            attempts: { lt: DEFAULT_MAX_ATTEMPTS },
        },
        orderBy: {
            scheduledAt: "asc",
        },
        take: batchSize,
    });

    for (const task of tasks) {
        await prisma.cloudinaryCleanupTask.update({
            where: { id: task.id },
            data: { status: MEDIA_CLEANUP_STATUS.PROCESSING },
        });

        try {
            await deleteFileFromCloudinary(task.url);

            await prisma.cloudinaryCleanupTask.update({
                where: { id: task.id },
                data: {
                    status: MEDIA_CLEANUP_STATUS.COMPLETED,
                    processedAt: new Date(),
                    error: null,
                },
            });
        } catch (error) {
            const attempts = task.attempts + 1;
            const isMaxAttemptReached =
                attempts >= (task.maxAttempts || DEFAULT_MAX_ATTEMPTS);

            await prisma.cloudinaryCleanupTask.update({
                where: { id: task.id },
                data: {
                    attempts,
                    status: isMaxAttemptReached
                        ? MEDIA_CLEANUP_STATUS.FAILED
                        : MEDIA_CLEANUP_STATUS.PENDING,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown cleanup error",
                    scheduledAt: new Date(
                        Date.now() + getRetryDelayInMs(attempts),
                    ),
                    processedAt: isMaxAttemptReached ? new Date() : null,
                },
            });
        }
    }

    return {
        processed: tasks.length,
    };
};
