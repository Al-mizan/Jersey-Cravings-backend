import { queueCloudinaryDeletion } from "./mediaCleanupQueue";
import { TPrismaTransactionClient } from "./mediaQueueTypes";

interface IQueueSingleMediaReplacementInput {
    tx: TPrismaTransactionClient;
    oldUrl?: string | null;
    newUrl?: string;
    context: string;
}

export const queueSingleMediaReplacementCleanup = async ({
    tx,
    oldUrl,
    newUrl,
    context,
}: IQueueSingleMediaReplacementInput) => {
    if (!oldUrl || !newUrl || oldUrl === newUrl) {
        return null;
    }

    return queueCloudinaryDeletion(tx, {
        url: oldUrl,
        context,
    });
};
