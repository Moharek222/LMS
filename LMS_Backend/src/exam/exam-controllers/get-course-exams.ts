import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";
import { Course } from "../../course/course-model";
import { Student } from "../../student/student-model";
import { Role } from "../../user/user-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const getCourseExams: RequestHandler<{ courseID: string }, IResponse> = async (req, res, next) => {
    try {
        const { courseID } = req.params;
        const id = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(courseID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }
        
        const courseExists = await Course.findOne({
            _id: courseID,
            isActive: true,
            isPublished: true
        }).lean().exec();
        if (!courseExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "course not found"
            });
        }
        if (req.user?.role === Role.Student) {
            const student = await Student.findById(id)
                .select("grade")
                .lean()
                .exec();

            if (!student) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "Student not found"
                });
            }

            if (!student.grade || !courseExists.grade) {
                return res.status(StatusCodes.CONFLICT).json({
                    message: "Student or course grade is not configured"
                });
            }

            if (student.grade !== courseExists.grade) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    message: "You are not authorized to access this course"
                });
            }
        }

        const examzes = await Exam.find({ courseID, isActive: true, isPublished: true })
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

