import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";
import { Course } from "../../course/course-model";


export const getCourseLessons: RequestHandler<{ courseID: string }> = async (req, res, next) => {
    try {
        const { courseID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }

        const course = await Course.find({ _id: courseID , isActive: true , isPublished: true})
        .lean()
        .exec();
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        const page=Math.max(1,Number(req.query.page) || 1);
        const limit=Math.max(1,Number(req.query.limit) || 10);

        const lessons = await Lesson.find({ courseID: courseID, isActive: true })
            .select("-contentUrl")
            .sort({ order: 1 })
            .skip((page-1)*limit)
            .limit(limit)
            .lean()
            .exec();

        const total = await Lesson.countDocuments({ courseID: courseID, isActive: true });
        res.status(StatusCodes.OK).json({
            message: "Lessons fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: lessons
        });
    } catch (err) {
        next(err);
    }
};


