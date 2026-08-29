import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export const generateUploadUrlValidation = [
    body("contentType")
        .trim()
        .notEmpty().withMessage("Content type is required")
        .isString().withMessage("Content type must be a string")
        .custom((value) => {
            if (!value.startsWith("video/")) {
                throw new Error("Only video formats are supported");
            }
            return true;
        })
];

interface IRequest {
    contentType: string;
}

interface IResponse {
    message: string;
    data?: unknown;
}

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
});

export const generateUploadUrl: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { contentType } = req.body;

        const fileKey = `lessons/${uuidv4()}-${Date.now()}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        res.status(StatusCodes.OK).json({
            message: "Presigned URL generated successfully",
            data: {
                uploadUrl,
                fileKey
            }
        });
    } catch (err) {
        next(err);
    }
};