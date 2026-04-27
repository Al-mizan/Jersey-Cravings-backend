import fs from "fs";
import path from "path";
import winston from "winston";
import { envVars } from "../config/env";

const logDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: envVars.NODE_ENV === "development" ? "debug" : "info",
    format: baseFormat,
    defaultMeta: { service: "jersey-cravings-backend" },
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, "exceptions.log"),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, "rejections.log"),
        }),
    ],
});

if (envVars.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    );
}
