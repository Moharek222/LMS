import { RequestHandler } from "express";
import mongoose from "mongoose";
import StatusCodes from "http-status-codes";
import { Quiz } from "../quiz-model";
import {body} from "express-validator";
import { Lesson } from "../../lesson/lesson-model";

export const createQuizValidation = [
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
        .isArray().withMessage("Options must be an array")
]

interface IQuestion{
    question: string;
    options: string[];
    answer: string;
}


interface IRequest{
    title:string;
    questions: IQuestion[];
    duration: number;
    passingPercentage: number;
}

interface IResponse{
    message: string;
    data?: any;
}

export const createQuiz: RequestHandler<{lessonID: string}, IResponse, IRequest> = async (req, res, next) => {
    try{
        const { lessonID } = req.params;
        if(!mongoose.Types.ObjectId.isValid(lessonID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }
        const lessonExists = await Lesson.findById(lessonID).select('_id').lean().exec();
        if (!lessonExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found, cannot create quiz for a non-existent lesson"
            });
        }
        const { title, questions, duration ,passingPercentage } = req.body;
        const quiz = await Quiz.create({
            lessonID,
            title,
            questions,
            duration,
            passingPercentage
        });
            res.status(StatusCodes.CREATED).json({
                message: "Quiz created successfully",
                data: quiz
            })
        
    }catch(err){
        next(err);
    }
}