import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";
import { startMediaCleanupWorker } from "./app/shared/mediaCleanupWorker";
import { ScheduledTask } from "node-cron";
import { logger } from "./app/lib/logger";

let server: Server;
let mediaCleanupWorker: ScheduledTask | null = null;
const bootstrap = async () => {
    try {
        await seedSuperAdmin();

        const enableMediaCleanupWorker = envVars.ENABLE_MEDIA_CLEANUP_WORKER !== "false";
        if (enableMediaCleanupWorker) {
            const schedule = envVars.MEDIA_CLEANUP_CRON_SCHEDULE || "0 * * * *";
            mediaCleanupWorker = startMediaCleanupWorker(schedule);
            console.log(
                `[MediaCleanupWorker] Started with cron schedule: ${schedule}`,
            );
            logger.info("Media cleanup worker started", { schedule });
        }

        server = app.listen(envVars.PORT, () => {
            console.log(
                `Server is running on http://localhost:${envVars.PORT}`,
            );
        });
    } catch (error) {
        logger.error("Failed to start server", { error });
    }
};

// SIGTERM signal handler
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down server...");
    mediaCleanupWorker?.stop();
    if (server) {
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(1);
        });
    }
    process.exit(1);
});

// SIGINT signal handler
process.on("SIGINT", () => {
    console.log("SIGINT signal received. Shutting down server...");
    mediaCleanupWorker?.stop();
    if (server) {
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(1);
        });
    }
    process.exit(1);
});

//uncaught exception handler for synchronous code
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception Detected... Shutting down server", {
        error,
    });
    mediaCleanupWorker?.stop();
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

// unhandled rejection handler for asynchronous code
process.on("unhandledRejection", (error) => {
    logger.error("Unhandled Rejection Detected... Shutting down server", {
        error,
    });
    mediaCleanupWorker?.stop();
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

bootstrap();
