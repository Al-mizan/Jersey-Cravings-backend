import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { envVars } from './env';
import status from 'http-status';
import AppError from '../errorHelpers/AppError';
import { logger } from '../lib/logger';

type TCloudinaryResourceType = 'image' | 'raw'; // | 'video'

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
    api_key: envVars.CLOUDINARY.API_KEY,
    api_secret: envVars.CLOUDINARY.API_SECRET,
});

export const uploadFileToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse> => {
    try {
        if(!buffer || !fileName) {
            throw new AppError(status.BAD_REQUEST, "Buffer and fileName are required");
        }
        const extension = fileName.split(".").pop()?.toLocaleLowerCase();

        const fileNameWithoutExtension = fileName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-]/g, "");

        const uniqueName =
            Math.random().toString(36).substring(2)+
            "-"+
            Date.now()+
            "-"+
            fileNameWithoutExtension;

        const folder = extension === "pdf" ? "pdfs" : "images";


        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder : `ph-healthcare/${folder}`,
                public_id: `ph-healthcare/${folder}/${uniqueName}`,
                resource_type : "auto"
            }, (error, result) => {
                if(error) {
                    return reject(new AppError(status.INTERNAL_SERVER_ERROR, `Error uploading file to Cloudinary: ${error}`));
                }
                resolve(result as UploadApiResponse);
            }).end(buffer);
        }); 
    } catch (error) {
        logger.error('Cloudinary upload failed', {
            fileName,
            error,
        });
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Error uploading file to Cloudinary: ${error}`);
    }
};

export const extractPublicIdFromCloudinaryUrl = (url: string) => {
    if (!url) {
        return null;
    }

    const normalizedUrl = url.split('?')[0];
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
    const match = normalizedUrl.match(regex);

    return match?.[1] ?? null;
};

const deleteCloudinaryAssetByPublicId = async (
    publicId: string,
    resourceType: TCloudinaryResourceType,
) => {
    return cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });
};

export const deleteFileFromCloudinaryByPublicId = async (
    publicId: string,
    resourceType: TCloudinaryResourceType | 'auto' = 'auto',
) => {
    if (!publicId) {
        throw new AppError(status.BAD_REQUEST, 'publicId is required to delete file from Cloudinary');
    }

    try {
        if (resourceType !== 'auto') {
            const response = await deleteCloudinaryAssetByPublicId(publicId, resourceType);
            logger.info('Cloudinary file cleanup result', {
                publicId,
                resourceType,
                result: response.result,
            });
            return response;
        }

        const resourceTypesToTry: TCloudinaryResourceType[] = ['image', 'raw']; //  'video',
        for (const type of resourceTypesToTry) {
            const response = await deleteCloudinaryAssetByPublicId(publicId, type);
            if (response.result === 'ok' || response.result === 'not found') {
                logger.info('Cloudinary file cleanup result', {
                    publicId,
                    resourceType: type,
                    result: response.result,
                });
                return response;
            }
        }

        return null;
    } catch (error) {
        logger.error('Cloudinary delete by publicId failed', {
            publicId,
            resourceType,
            error,
        });
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Error deleting file ${publicId} from Cloudinary: ${error}`);
    }
};

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const publicId = extractPublicIdFromCloudinaryUrl(url);
        if (!publicId) {
            logger.warn('Invalid Cloudinary URL provided for deletion', { url });
            throw new AppError(status.BAD_REQUEST, `File ${url} is not a valid Cloudinary URL`);
        }

        return deleteFileFromCloudinaryByPublicId(publicId, 'auto');
    } catch (error) {
        logger.error('Cloudinary delete by URL failed', {
            url,
            error,
        });
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Error deleting file ${url} from Cloudinary: ${error}`);
    }
};

export const cloudinaryUpload = cloudinary;
