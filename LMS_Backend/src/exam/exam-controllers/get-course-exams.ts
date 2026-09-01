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

        const courseExists = await Course.findById(courseID).lean().exec();
        if (!courseExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "course not found"
            });
        }
        const examzes = await Exam.find({ courseID, isActive: true })
            .select("-questions")
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        res.status(StatusCodes.OK).json({
            message: "exams fetched successfully",
            data: examzes
        });
    } catch (err) {
        next(err);
    }
};

