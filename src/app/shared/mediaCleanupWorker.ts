import cron from "node-cron";
import { processCloudinaryCleanupQueue } from "./mediaCleanupQueue";
import { logger } from "../lib/logger";

const DEFAULT_SCHEDULE = "0 * * * *";

export const startMediaCleanupWorker = (schedule = DEFAULT_SCHEDULE) => {
    if (!cron.validate(schedule)) {
        throw new Error(
            `Invalid media cleanup cron expression provided: ${schedule}`,
        );
    }

    return cron.schedule(schedule, async () => {
        try {
            const result = await processCloudinaryCleanupQueue();
            if (result.processed > 0) {
                logger.info("Media cleanup tasks processed", {
                    processed: result.processed,
                });
            }
        } catch (error) {
            logger.error("[MediaCleanupWorker] Failed to process queue", {
                error,
            });
        }
    });
};
