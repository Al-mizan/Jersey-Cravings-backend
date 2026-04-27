import { Request } from "express";

export const getFilesFromRequest = (req: Request): Express.Multer.File[] => {
    if (req.file) {
        return [req.file];
    }

    if (Array.isArray(req.files)) {
        return req.files;
    }

    return [];
};

export const getFilesByFieldName = (
    req: Request,
    fieldName: string,
): Express.Multer.File[] => {
    if (req.file) {
        return req.file.fieldname === fieldName ? [req.file] : [];
    }

    if (Array.isArray(req.files)) {
        return req.files.filter((file) => file.fieldname === fieldName);
    }

    if (req.files && typeof req.files === "object") {
        const fieldFiles = (req.files as Record<string, Express.Multer.File[]>)[
            fieldName
        ];

        return Array.isArray(fieldFiles) ? fieldFiles : [];
    }

    return [];
};
