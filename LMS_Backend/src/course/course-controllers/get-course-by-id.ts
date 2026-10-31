import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Course } from "../course-model";
import { Student } from "../../student/student-model";
import { Role } from "../../user/user-model";


export const getCourseById: RequestHandler<{ courseID: string }> = async (req, res, next) => {
    try {
        const id = req.user?.id;
        const { courseID } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }

        const course = await Course.findById(courseID).lean().exec();
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found"
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

            if (!student.grade || !course.grade) {
                return res.status(StatusCodes.CONFLICT).json({
                    message: "Student or course grade is not configured"
                });
            }

            if (student.grade !== course.grade) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    message: "You are not authorized to access this course"
                });
            }

            if (!course.isActive || !course.isPublished) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "Course not found"
                });
            }
        }
        res.status(StatusCodes.OK).json({
            message: "Course fetched successfully",
            data: course
        });
    } catch (err) {
        next(err);
    }
}