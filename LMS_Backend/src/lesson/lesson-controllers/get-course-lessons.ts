import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";
import { Course } from "../../course/course-model";
import { Student } from "../../student/student-model";
import { Role } from "../../user/user-model";


export const getCourseLessons: RequestHandler<{ courseID: string }> = async (req, res, next) => {
    try {
        const { courseID } = req.params;
        const id = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(courseID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }
        const course = await Course.findOne({
            _id: courseID
            , isActive: true,
            isPublished: true
        })
            .lean()
            .exec();
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found or not authorized to access this course"
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
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);

        const lessons = await Lesson.find({ courseID: courseID, isActive: true })
            .select("-contentUrl")
            .sort({ order: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();

        const lessonsWithPdfStatus = lessons.map(({ pdfKey, ...lesson }) => ({
            ...lesson,
            hasPdf: Boolean(pdfKey),
        }));

        const total = await Lesson.countDocuments({ courseID: courseID, isActive: true });
        res.status(StatusCodes.OK).json({
            message: "Lessons fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: lessonsWithPdfStatus
        });
    } catch (err) {
        next(err);
    }
};


