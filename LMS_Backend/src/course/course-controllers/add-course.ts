import { RequestHandler } from "express";
import StatusCodes from "http-status-codes";
import { Course } from "../course-model";
import { body } from "express-validator";
import { Grade } from "../../interfaces/grade";
import { AcademicTrack } from "../../interfaces/academic-track";


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
        .withMessage("Invalid grade"),
    body("academicTrack")
        .optional()
        .isIn(Object.values(AcademicTrack))
        .withMessage("Invalid academic track")
];

interface IRequest {
    title: string,
    grade: Grade,
    isPublished?: boolean,
    academicTrack?: AcademicTrack;
}
interface IResponse {
    message: string
    data?: unknown
}

export const addCourse: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { title, isPublished, grade ,academicTrack } = req.body;
        if(grade === Grade.SecondSecondary){
            if(!academicTrack){
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Please provide academic track"
                });
            }
        }
        const course = await Course.create({
            title,
            isPublished,
            grade,
            academicTrack
        });
        res.status(StatusCodes.CREATED).json({
            message: "Course created successfully",
            data: course
        });
    } catch (err) {
        next(err);
    }
}