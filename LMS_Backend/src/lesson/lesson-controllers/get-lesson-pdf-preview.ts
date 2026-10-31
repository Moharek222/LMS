import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";

interface IResponse {
    message: string;
    data?: {
        title: string;
        pdfPreviewUrl: string;
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

export const getLessonPdfPreview: RequestHandler<{ lessonID: string }, IResponse> = async (req, res, next) => {
    try {
        const { lessonID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lessonID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format",
            });
        }

        const lesson = await Lesson.findOne({ _id: lessonID, isActive: true })
            .select("title pdfKey")
            .lean()
            .exec();

        if (!lesson) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found",
            });
        }

        if (!lesson.pdfKey) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "This lesson does not have a PDF file",
            });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: lesson.pdfKey,
            ResponseContentType: "application/pdf",
            ResponseContentDisposition: `inline; filename="lesson-${lessonID}.pdf"`,
        });

        const pdfPreviewUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return res.status(StatusCodes.OK).json({
            message: "PDF preview URL generated successfully",
            data: {
                title: lesson.title,
                pdfPreviewUrl,
            },
        });
    } catch (err) {
        next(err);
    }
};
