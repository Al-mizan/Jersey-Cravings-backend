import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { logger } from "../lib/logger";

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
});

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, unknown>;
    attachments?: Array<{
        filename: string;
        content?: Buffer | string;
        contentType?: string;
        path?: string;
    }>;
}

export const sendEmail = async ({
    subject,
    templateData,
    templateName,
    to,
    attachments,
}: SendEmailOptions) => {
    const templatePath = path.resolve(
        process.cwd(),
        `src/app/templates/${templateName}.ejs`,
    );

    try {
        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
                path: attachment.path,
            })),
        });

        logger.info("Email sent", {
            to,
            subject,
            templateName,
            messageId: info.messageId,
        });
    } catch (error) {
        logger.error("Email sending failed", {
            to,
            subject,
            templateName,
            error,
        });
        throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            "Failed to send email",
        );
    }
};
