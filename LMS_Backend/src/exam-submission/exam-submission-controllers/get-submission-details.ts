import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ExamSubmission } from "../exam-submission-model";

export const getSubmissionDetails: RequestHandler<{ submissionID: string }> = async (req, res, next) => {
    try {
        const { submissionID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(submissionID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid submission ID format" });
        }

        const submission = await ExamSubmission.findById(submissionID)
            .populate("examID", "title duration")
            .populate("studentID", "name email")
            .lean()
            .exec();

        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Submission not found" });
        }

        res.status(StatusCodes.OK).json({
            message: "Submission details fetched successfully",
            data: submission
        });
    } catch (err) {
        next(err);
    }
};
