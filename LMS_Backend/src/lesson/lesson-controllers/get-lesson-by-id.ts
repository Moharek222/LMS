import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
});


interface IResponse {
    message: string;
    data?: unknown;
}

export const getLessonById: RequestHandler<{ lessonId: string }, IResponse, {}> = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }
        const lesson = await Lesson.findOne({ _id: lessonId, isActive: true });
        if (!lesson) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found"
            });
        }
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: lesson.contentUrl
        });

        const videoUrl = await getSignedUrl(r2Client, command, { expiresIn: 7200 });
        res.status(StatusCodes.OK).json({
            message: "Video URL generated successfully",
            data: {
                title: lesson.title,
                videoUrl
            }
        });

    } catch (err) {
        next(err);
    }
};