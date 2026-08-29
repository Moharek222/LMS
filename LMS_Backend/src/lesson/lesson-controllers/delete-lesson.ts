import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Lesson } from "../lesson-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const deleteLesson: RequestHandler<{ id: string }, IResponse> = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const lesson = await Lesson.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        ).lean().exec();

        if (!lesson) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Lesson not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Lesson deleted (archived) successfully",
            data: lesson
        });
    } catch (err) {
        next(err);
    }
};

