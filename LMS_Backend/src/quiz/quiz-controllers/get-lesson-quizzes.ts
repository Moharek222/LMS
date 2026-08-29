import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Quiz } from "../quiz-model";
import { Lesson } from "../../lesson/lesson-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const getLessonQuizzes: RequestHandler<{ lessonId: string }, IResponse> = async (req, res, next) => {
    try {
        const { lessonId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const lessonExists = await Lesson.findById(lessonId).select('_id').lean().exec();
        if (!lessonExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found"
            });
        }

        // Fetch active quizzes for this lesson.
        // We exclude the questions array from the list view to reduce payload size and prevent exposing answers.
        const quizzes = await Quiz.find({ lessonID: lessonId, isActive: true })
            .select("-questions")
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        res.status(StatusCodes.OK).json({
            message: "Quizzes fetched successfully",
            data: quizzes
        });
    } catch (err) {
        next(err);
    }
};

