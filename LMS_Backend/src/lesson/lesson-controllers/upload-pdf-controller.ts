import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export const generatePdfUploadUrlValidation = [
    body("contentType")
        .isString().withMessage("Content type must be a string")
        .bail()
        .trim()
        .custom((value: string) => {
            if (value !== "application/pdf") {
                throw new Error("Only PDF files are supported");
            }
            return true;
        })
];

interface IRequest {
    contentType: string;
}

interface IResponse {
    message: string;
    data?: {
        uploadUrl: string;
        pdfKey: string;
    };
}

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
});

export const generatePdfUploadUrl: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const pdfKey = `lessons/pdfs/${uuidv4()}-${Date.now()}.pdf`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: pdfKey,
            ContentType: "application/pdf",
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        res.status(StatusCodes.OK).json({
            message: "PDF upload URL generated successfully",
            data: {
                uploadUrl,
                pdfKey,
            },
        });
    } catch (err) {
        next(err);
    }
};
