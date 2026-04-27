import { Request } from "express";
import { extractPublicIdFromCloudinaryUrl } from "../config/cloudinary.config";

export const MEDIA_CLEANUP_STATUS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    FAILED: "FAILED",
    COMPLETED: "COMPLETED",
} as const;

export type TMediaCleanupStatus =
    (typeof MEDIA_CLEANUP_STATUS)[keyof typeof MEDIA_CLEANUP_STATUS];

export interface IMediaCleanupTaskInput {
    url: string;
    context?: string;
    maxAttempts?: number;
    scheduledAt?: Date;
}

export interface IMediaFromFile {
    publicId: string;
    secureUrl: string;
    resourceType: "image" | "raw";  // | "video"
}

export const parseMultipartDataField = <T>(req: Request): T => {
    if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
    }

    return req.body as T;
};

export const inferResourceTypeFromMimetype = (
    mimeType?: string,
): "image" | "raw" => { //| "video"
    if (!mimeType) {
        return "raw";
    }

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    // if (mimeType.startsWith("video/")) {
    //     return "video";
    // }

    return "raw";
};

export const mapMulterFileToMedia = (
    file: Express.Multer.File,
): IMediaFromFile | null => {
    const secureUrl = file.path;
    const publicId = extractPublicIdFromCloudinaryUrl(secureUrl);

    if (!secureUrl || !publicId) {
        return null;
    }

    return {
        publicId,
        secureUrl,
        resourceType: inferResourceTypeFromMimetype(file.mimetype),
    };
};
