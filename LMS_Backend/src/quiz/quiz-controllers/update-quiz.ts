import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Quiz } from "../quiz-model";

export const updateQuizValidation = [
    body("title")
        .optional()
        .trim()
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

body("questions")
        .optional()
        .isArray({ min: 1 }).withMessage("At least one question is required if updating questions"), // ضفنا الحد الأدنى

    body("questions.*.question")
        .if(body("questions").exists())
        .trim()
        .notEmpty().withMessage("Question is required")
        .isString().withMessage("Question must be a string")
        .isLength({ min: 3 }).withMessage("Question must be at least 3 characters long"),

    body("questions.*.options")
        .if(body("questions").exists())
        .notEmpty().withMessage("Options are required")
        .isArray({ min: 2 }).withMessage("At least two options are required"),

    body("questions.*.answer")
        .if(body("questions").exists())
        .trim()
        .notEmpty().withMessage("Answer is required")
        .isString().withMessage("Answer must be a string"), 

    body("duration")
        .optional()
        .isNumeric().withMessage("Duration must be a number")
        .custom(value => value >= 0).withMessage("Duration cannot be negative")
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
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateQuiz: RequestHandler<{ quizID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { quizID } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(quizID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid quiz ID format"
            });
        }

        const { title, questions, duration } = req.body;
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (questions !== undefined) updateData.questions = questions;
        if (duration !== undefined) updateData.duration = duration;

        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }

        const quiz = await Quiz.findByIdAndUpdate(
            quizID,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!quiz) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Quiz not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Quiz updated successfully",
            data: quiz
        });
    } catch (err) {
        next(err);
    }
};

