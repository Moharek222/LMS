import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const getExamForAdmin: RequestHandler<{ examID: string }, IResponse> = async (req, res, next) => {
    try {
        const { examID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }

        const exam = await Exam.findById(examID).lean().exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Exam fetched successfully",
            data: exam
        });
    } catch (err) {
        next(err);
    }
};

