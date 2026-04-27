import { NextFunction, Request, Response } from "express";
import { IUpdateProductMediaPayload } from "./product-media.interface";
import { getFilesByFieldName } from "../../../shared/mediaMiddlewareFactory";
import {
    parseMultipartDataField,
    mapMulterFileToMedia,
} from "../../../shared/mediaStrategy";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

export const productMediaMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload: IUpdateProductMediaPayload =
        parseMultipartDataField<IUpdateProductMediaPayload>(req);

    const files = getFilesByFieldName(
        req,
        MEDIA_FIELD_CONFIG.PRODUCT_PHOTOS.name,
    );
    if (files.length > 0) {
        const mappedMedia = mapMulterFileToMedia(files[0]);
        if (mappedMedia) {
            payload.publicId = mappedMedia.publicId;
            payload.secureUrl = mappedMedia.secureUrl;
            payload.resourceType = "image";
        }
    }

    req.body = payload;
    next();
};
