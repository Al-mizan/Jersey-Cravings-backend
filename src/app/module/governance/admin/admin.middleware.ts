import { NextFunction, Request, Response } from "express";
import { IUpdateAdminPayload } from "./admin.interface";
import { getFilesByFieldName } from "../../../shared/mediaMiddlewareFactory";
import { parseMultipartDataField } from "../../../shared/mediaStrategy";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

export const updateMyAdminProfileMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload: IUpdateAdminPayload =
        parseMultipartDataField<IUpdateAdminPayload>(req);

    const [profilePhoto] = getFilesByFieldName(
        req,
        MEDIA_FIELD_CONFIG.ADMIN_PROFILE_PHOTO,
    );

    if (profilePhoto?.path) {
        payload.profilePhoto = profilePhoto.path;
    }

    req.body = payload;
    next();
};
