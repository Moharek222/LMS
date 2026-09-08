import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";
import { body } from "express-validator";
import { Course } from "../../course/course-model";

export const createExamValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

    body("duration")
        .notEmpty().withMessage("Duration is required")
        .isNumeric().withMessage("Duration must be a number"),

    body("questions.*.type")
        .optional()
        .isIn(["MCQ", "ESSAY"]).withMessage("Question type must be either MCQ or ESSAY"),

    body("questions.*.question")
        .trim()
        .notEmpty().withMessage("Question text is required")
        .isString().withMessage("Question text must be a string")
        .isLength({ min: 3 }).withMessage("Question must be at least 3 characters long"),

    body("questions.*.questionImage")
        .optional()
        .trim()
        .isString().withMessage("Question image must be a string URL"),

    body("questions")
        .notEmpty().withMessage("Questions are required")
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
    type?: "MCQ" | "ESSAY";
    points: number;
    question: string;
    questionImage?: string;
    options?: string[];
    answer?: string;
}

interface IRequest {
    title: string;
    questions: IQuestion[];
    duration: number;
}

interface IResponse {
    message: string;
    data?: any;
}

export const createExam: RequestHandler<{ courseID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { courseID } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }
        
        const courseExists = await Course.findById(courseID).lean().exec();
        if (!courseExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found, cannot create exam for a non-existent course"
            });
        }
        
        const { title, questions, duration } = req.body;
        const exam = await Exam.create({
            courseID,
            title,
            questions,
            duration
        });
        
        res.status(StatusCodes.CREATED).json({
            message: "Exam created successfully",
            data: exam
        });
        
    } catch (err) {
        next(err);
    }
};