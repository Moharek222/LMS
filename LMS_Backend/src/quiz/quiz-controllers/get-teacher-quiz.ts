import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Quiz } from "../quiz-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const getQuizForAdmin: RequestHandler<{ quizID: string }, IResponse> = async (req, res, next) => {
    try {
        const { quizID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(quizID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid quiz ID format"
            });
        }

        const quiz = await Quiz.findById(quizID).lean().exec();

        if (!quiz) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Quiz not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Quiz fetched successfully",
            data: quiz
        });
    } catch (err) {
        next(err);
    }
};