import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Course } from "../course-model";
import { Student } from "../../student/student-model";
import { Grade } from "../../interfaces/grade";


export const getStudentCourses: RequestHandler = async (req, res, next) => {
    try {
        const id = req.user?.id
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);

        const student = await Student.findById(id)
        if (!student) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }
        if (!student.grade) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Student grade has not been assigned yet"
            });
        }
        const filterQuery: any  = { 
            isActive: true,
            isPublished: true,
            grade: student.grade
        };
        if(student.grade===Grade.SecondSecondary){
            filterQuery.academicTrack = student.academicTrack
        }

        const [courses, total] = await Promise.all([
            Course.find(filterQuery)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            Course.countDocuments(filterQuery)
        ])
        res.status(StatusCodes.OK).json({
            message: "Courses fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: courses
        });
    } catch (err) {
        next(err);
    }
}