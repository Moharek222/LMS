import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Exam } from "../exam-model";

export const updateExamValidation = [
    body("title")
        .optional()
        .trim()
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

    body("questions")
        .optional()
        .isArray().withMessage("Questions must be an array"),

    body("questions.*.question")
        .if(body("questions").exists())
        .trim()
        .notEmpty().withMessage("Question is required")
        .isString().withMessage("Question must be a string")
        .isLength({ min: 3 }).withMessage("Question must be at least 3 characters long"),

    body("questions.*.options")
        .if(body("questions").exists())
        .notEmpty().withMessage("Options are required")
        .isArray().withMessage("Options must be an array"),

    body("questions.*.answer")
        .if(body("questions").exists())
        .trim()
        .notEmpty().withMessage("Answer is required"),

    body("duration")
        .optional()
        .isNumeric().withMessage("Duration must be a number"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean")
];

interface IQuestion {
    question: string;
    options: string[];
    answer: string;
}

interface IRequest {
    title?: string;
    questions?: IQuestion[];
    duration?: number;
    isActive?: boolean;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateExam: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }

        const { title, questions, duration, isActive } = req.body;
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (questions !== undefined) updateData.questions = questions;
        if (duration !== undefined) updateData.duration = duration;
        if (typeof isActive === "boolean") updateData.isActive = isActive;

        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }

        const exam = await Exam.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "exam not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "exam updated successfully",
            data: exam
        });
    } catch (err) {
        next(err);
    }
};

