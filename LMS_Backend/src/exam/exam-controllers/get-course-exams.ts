import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";
import { Course } from "../../course/course-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const getCourseExams: RequestHandler<{ courseID: string }, IResponse> = async (req, res, next) => {
    try {
        const { courseID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }

        const courseExists = await Course.findById(courseID).select('_id').lean().exec();
        if (!courseExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found"
            });
        }

        // Fetch active exams for this course.
        // We exclude the questions array from the list view to reduce payload size and prevent exposing answers.
        const exams = await Exam.find({ courseID: courseID, isActive: true })
            .select("-questions")
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        res.status(StatusCodes.OK).json({
            message: "Exams fetched successfully",
            data: exams
        });
    } catch (err) {
        next(err);
    }
};

