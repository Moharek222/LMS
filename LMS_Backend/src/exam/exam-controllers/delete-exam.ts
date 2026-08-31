import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const deleteExam: RequestHandler<{ id: string }, IResponse> = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }

        const exam = await Exam.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        ).lean().exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Exam deleted (archived) successfully",
            data: exam
        });
    } catch (err) {
        next(err);
    }
};

