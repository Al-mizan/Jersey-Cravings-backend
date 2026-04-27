import { NextFunction, Request, Response } from "express";
import { IUpdateReviewPayload } from "./review.interface";
import { getFilesByFieldName } from "../../../shared/mediaMiddlewareFactory";
import {
    mapMulterFileToMedia,
    parseMultipartDataField,
} from "../../../shared/mediaStrategy";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

export const reviewMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload: IUpdateReviewPayload =
        parseMultipartDataField<IUpdateReviewPayload>(req);

    const files = getFilesByFieldName(
        req,
        MEDIA_FIELD_CONFIG.REVIEW_PHOTOS.name,
    );
    if (files.length > 0) {
        const newMedias = files
            .map((file) => mapMulterFileToMedia(file))
            .filter((media): media is NonNullable<typeof media> =>
                Boolean(media),
            );

        if (newMedias.length > 0) {
            payload.medias = [...(payload.medias || []), ...newMedias];
        }
    }

    req.body = payload;
    next();
};
