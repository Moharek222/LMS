import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../exam-model";

export const getExamForStudent: RequestHandler<{examID: string}> = async (req, res, next) => {
    try {
        const { examID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid lesson ID format"
            });
        }

        const exam = await Exam.findOne({ _id: examID, isActive: true })
            .select("-questions.answer")
            .lean()
            .exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No exam found for this Course"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "exam fetched successfully",
            data: exam
        });
        
    } catch (err) {
        next(err);
    }
}