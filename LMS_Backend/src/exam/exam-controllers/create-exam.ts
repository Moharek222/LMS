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

    body("questions")
        .notEmpty().withMessage("Questions are required")
        .isArray().withMessage("Questions must be an array"),

    body("questions.*.question")
        .trim()
        .notEmpty().withMessage("Question is required")
        .isString().withMessage("Question must be a string")
        .isLength({ min: 3 }).withMessage("Question must be at least 3 characters long"),

    body("questions.*.options")
        .notEmpty().withMessage("Options are required")
        .isArray().withMessage("Options must be an array"),

    body("questions.*.answer")
        .trim()
        .notEmpty().withMessage("Answer is required"),

    body("duration")
        .notEmpty().withMessage("Duration is required")
        .isNumeric().withMessage("Duration must be a number"),
];

interface IQuestion {
    question: string;
    options: string[];
    answer: string;
}

interface IRequest {
    title: string;
    questions: IQuestion[];
    duration: number;
    passingPercentage: number;
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