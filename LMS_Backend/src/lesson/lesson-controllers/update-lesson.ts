import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";

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
    order?: number;
    requiresPassing?: boolean;
    isActive?: boolean;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateLesson: RequestHandler<{ lessonID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { lessonID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lessonID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const { title, description, order, requiresPassing, isActive } = req.body;
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
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

        res.status(StatusCodes.OK).json({
            message: "Lesson updated successfully",
            data: lesson
        });
    } catch (err) {
        next(err);
    }
};

