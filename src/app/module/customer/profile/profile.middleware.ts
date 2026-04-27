import { NextFunction, Request, Response } from "express";
import { IUpdateMyProfilePayload } from "./profile.interface";
import { getFilesByFieldName } from "../../../shared/mediaMiddlewareFactory";
import { parseMultipartDataField } from "../../../shared/mediaStrategy";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

export const updateMyCustomerProfileMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload: IUpdateMyProfilePayload =
        parseMultipartDataField<IUpdateMyProfilePayload>(req);

    const [profilePhoto] = getFilesByFieldName(
        req,
        MEDIA_FIELD_CONFIG.PROFILE_PHOTO,
    );

    if (profilePhoto?.path) {
        payload.profilePhoto = profilePhoto.path;
    }

    req.body = payload;
    next();
};
