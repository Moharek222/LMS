import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Course } from "../course-model";
import { body } from "express-validator";


export const updateCourseValidation = [
    body("title")
        .optional()
        .trim()
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),

    body("isPublished")
        .optional()
        .isBoolean().withMessage("isPublished must be a boolean (true or false)"),
];

interface IRequest {
    title?: string
    isPublished?: boolean
}

interface IResponse {
    message: string
    data?: unknown
}

export const updateCourse: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, isPublished } = req.body;
        const updateData: any = {};
        if (title !== undefined) {
            updateData.title = req.body.title;
        }
        if (isPublished !== undefined) {
            updateData.isPublished = req.body.isPublished;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }
        const course = await Course.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true, runValidators: true })
            .lean()
            .exec();
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Course updated successfully",
            data: course
        });
    } catch (err) {
        next(err);
    }
}