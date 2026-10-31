import { RequestHandler } from "express";
import StatusCodes from "http-status-codes";
import { Course } from "../course-model";
import { body } from "express-validator";
import { Grade } from "../../interfaces/grade";


export const addCourseValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

    body("isPublished")
        .optional()
        .isBoolean().withMessage("isPublished must be a boolean (true or false)"),
    body("grade")
        .notEmpty()
        .withMessage("Grade is required")
        .isIn(Object.values(Grade))
        .withMessage("Invalid grade")
];

interface IRequest {
    title: string,
    grade: Grade,
    isPublished?: boolean
}
interface IResponse {
    message: string
    data?: unknown
}

export const addCourse: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { title, isPublished, grade } = req.body;
        const course = await Course.create({ title, isPublished, grade });
        res.status(StatusCodes.CREATED).json({
            message: "Course created successfully",
            data: course
        });
    } catch (err) {
        next(err);
    }
}