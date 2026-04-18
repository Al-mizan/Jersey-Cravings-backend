import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { envVars } from './env';
import status from 'http-status';
import AppError from '../errorHelpers/AppError';

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
        console.log(`Error uploading file to Cloudinary: ${error}`);
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Error uploading file to Cloudinary: ${error}`);
    }
};

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
        const publicId = match[1];
        await cloudinary.uploader.destroy(
            publicId, {
                resource_type: "image",
            }
        );
        console.log(`File ${publicId} deleted from Cloudinary`);
    } else {
        console.log(`File ${url} is not a valid Cloudinary URL`);
        throw new AppError(status.BAD_REQUEST, `File ${url} is not a valid Cloudinary URL`);
    }
    } catch (error) {
        console.log(`Error deleting file ${url} from Cloudinary: ${error}`);
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Error deleting file ${url} from Cloudinary: ${error}`);
    }
};

export const cloudinaryUpload = cloudinary;