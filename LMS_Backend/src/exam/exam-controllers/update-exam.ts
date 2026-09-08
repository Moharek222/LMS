import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Exam } from "../exam-model";

export const updateExamValidation =[
    body("title")
        .optional()
        .trim()
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

    body("duration")
        .optional()
        .isNumeric().withMessage("Duration must be a number"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean"),

    body("questions.*.type")
        .optional()
        .isIn(["MCQ", "ESSAY"]).withMessage("Question type must be either MCQ or ESSAY"),

    body("questions.*.question")
        .if(body("questions").exists())
        .trim()
        .notEmpty().withMessage("Question text is required")
        .isString().withMessage("Question text must be a string")
        .isLength({ min: 3 }).withMessage("Question must be at least 3 characters long"),

    body("questions.*.questionImage")
        .optional()
        .trim()
        .isString().withMessage("Question image must be a string URL"),

    body("questions")
        .optional()
        .isArray({ min: 1 }).withMessage("Questions must be an array with at least one question")
        .custom((questions: any[]) => {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const type = q.type || "MCQ";

                if (typeof q.points !== "number" || q.points < 1) {
                    throw new Error(`Question ${i + 1} must have a valid points value (minimum 1)`);
                }

                if (type === "MCQ") {
                    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
                        throw new Error(`Question ${i + 1} is MCQ and must have an options array with at least 2 items`);
                    }
                    if (!q.answer || typeof q.answer !== "string" || q.answer.trim() === "") {
                        throw new Error(`Question ${i + 1} is MCQ and must have an answer`);
                    }
                    if (!q.options.includes(q.answer)) {
                        throw new Error(`Question ${i + 1} answer must exactly match one of its options`);
                    }
                }
            }
            return true;
        }),
];

interface IQuestion {
    question: string;
    type?: "MCQ" | "ESSAY";
    points: number;
    questionImage?: string;
    options?: string[];
    answer?: string;
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

export const updateExam: RequestHandler<{ examID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { examID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
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
            examID,
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

