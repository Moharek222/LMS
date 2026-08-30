import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Quiz } from "../quiz-model";

export const getQuizForStudent: RequestHandler<{quizID: string}> = async (req, res, next) => {
    try {
        const { quizID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(quizID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const quiz = await Quiz.findOne({ quizID, isActive: true })
            .select("-questions.answer")
            .lean()
            .exec();

        if (!quiz) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No quiz found for this lesson"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Quiz fetched successfully",
            data: quiz
        });
        
    } catch (err) {
        next(err);
    }
}