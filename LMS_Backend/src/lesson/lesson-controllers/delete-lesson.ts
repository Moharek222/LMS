import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Lesson } from "../lesson-model"; 
import mongoose from "mongoose";

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
});

export const deleteLesson: RequestHandler<{ lessonID: string }, any, any> = async (req, res, next) => {
    try {
        const { lessonID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lessonID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const lesson = await Lesson.findById(lessonID);
        
        if (!lesson) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found"
            });
        }

        if (lesson.contentUrl) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: lesson.contentUrl, 
            });
            
            await r2Client.send(deleteCommand);
        }

        lesson.isActive = true;
        lesson.contentUrl = "";
        
        await lesson.save();

        res.status(StatusCodes.OK).json({
            message: "Lesson deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};