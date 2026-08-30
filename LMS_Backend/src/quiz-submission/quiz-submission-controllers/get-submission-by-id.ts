import { RequestHandler } from "express";
import { QuizSubmission } from "../quiz-submission-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";




export const getSubmissionById: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
        const { id } = req.params;
        const studentID = req.user?.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid quiz submission ID format"
            });
        }

        const submission = await QuizSubmission.findOne({ _id : id , studentID})
            .populate([
                {
                    path: "quizID",
                    select: "title"
                },
                {
                    path: "studentID",
                    select: "name"
                }
            ])
            .lean()
            .exec();

        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Submission not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Submission fetched successfully",
            data: submission
        });
    } catch (err) {
        next(err);
    }
}