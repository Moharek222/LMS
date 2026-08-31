import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../exam-model";

export const getExamForStudent: RequestHandler<{ examID: string }> = async (req, res, next) => {
    try {
        const { examID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }

        const exam = await Exam.findOne({ _id: examID, isActive: true })
            .select("-questions.answer") // Hide answers from students
            .lean()
            .exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found or inactive"
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

