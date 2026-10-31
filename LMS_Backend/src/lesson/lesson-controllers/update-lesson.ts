import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const updateLessonValidation = [
    body("title")
        .optional()
        .trim()
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

    body("description")
        .optional()
        .trim()
        .isString().withMessage("Description must be a string")
        .isLength({ min: 3 }).withMessage("Description must be at least 3 characters long"),

    body("pdfKey")
        .optional()
        .isString().withMessage("PDF key must be a string")
        .bail()
        .trim()
        .notEmpty().withMessage("PDF key cannot be empty")
        .bail()
        .custom((value: string) => {
            if (!value.startsWith("lessons/pdfs/") || !value.endsWith(".pdf")) {
                throw new Error("Invalid PDF key");
            }
            return true;
        }),

    body("order")
        .optional()
        .isNumeric().withMessage("Order must be a number"),

    body("requiresPassing")
        .optional()
        .isBoolean().withMessage("requiresPassing must be a boolean (true or false)"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean (true or false)")
];

interface IRequest {
    title?: string;
    description?: string;
    pdfKey?: string;
    order?: number;
    requiresPassing?: boolean;
    isActive?: boolean;
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

export const updateLesson: RequestHandler<{ lessonID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { lessonID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lessonID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const { title, description, pdfKey, order, requiresPassing, isActive } = req.body;
        const existingLesson = await Lesson.findById(lessonID).select("pdfKey").lean().exec();

        if (!existingLesson) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found",
            });
        }
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (pdfKey !== undefined) updateData.pdfKey = pdfKey;
        if (order !== undefined) updateData.order = order;
        if (typeof requiresPassing === "boolean") updateData.requiresPassing = requiresPassing;
        if (typeof isActive === "boolean") updateData.isActive = isActive;

        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }

        const lesson = await Lesson.findByIdAndUpdate(
            lessonID,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!lesson) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found"
            });
        }

        // Remove the previous PDF only after the new key has been saved successfully.
        if (pdfKey && existingLesson.pdfKey && existingLesson.pdfKey !== pdfKey) {
            try {
                await r2Client.send(new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: existingLesson.pdfKey,
                }));
            } catch (deleteError) {
                // The lesson update succeeded; log cleanup failure without failing the request.
                console.error("Failed to delete the previous lesson PDF:", deleteError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: "Lesson updated successfully",
            data: lesson
        });
    } catch (err) {
        next(err);
    }
};

