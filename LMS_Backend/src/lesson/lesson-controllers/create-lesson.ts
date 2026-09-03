import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Lesson } from "../lesson-model";
import { Course } from "../../course/course-model";
import mongoose from "mongoose";

export const addLessonValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),
    body("description")
        .optional()
        .trim()
        .isString().withMessage("Description must be a string")
        .isLength({ min: 3 }).withMessage("Description must be at least 3 characters long"),
        
    body("contentUrl")
        .trim()
        .notEmpty().withMessage("Content URL (or File Key) is required")
        .isString().withMessage("Content URL must be a string"),
        
    body("order")
        .notEmpty().withMessage("Order is required")
        .isNumeric().withMessage("Order must be a number"),
        
    body("requiresPassing")
        .optional()
        .isBoolean().withMessage("requiresPassing must be a boolean (true or false)")
];

interface IRequest {
    courseID: string
    title: string;
    description?: string;
    contentUrl: string;
    order: number;
    requiresPassing?: boolean;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const createLesson: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { title, description, contentUrl, order, requiresPassing ,courseID } = req.body;
        if(!mongoose.Types.ObjectId.isValid(courseID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found"
            });
        }

        const lesson = await Lesson.create({
            title,
            courseID,
            description,
            contentUrl,
            order,
            requiresPassing
        });

        res.status(StatusCodes.CREATED).json({
            message: "Lesson created successfully",
            data: lesson
        });
    } catch (err) {
        next(err);
    }
};

