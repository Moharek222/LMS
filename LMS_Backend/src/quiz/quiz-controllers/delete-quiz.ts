import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Quiz } from "../quiz-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const deleteQuiz: RequestHandler<{ id: string }, IResponse> = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid quiz ID format"
            });
        }

        const quiz = await Quiz.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        ).lean().exec();

        if (!quiz) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Quiz not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Quiz deleted (archived) successfully",
            data: quiz
        });
    } catch (err) {
        next(err);
    }
};

