import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ExamSubmission } from "../exam-submission-model";

export const getSubmissionResult: RequestHandler<{ submissionID: string }> = async (req, res, next) => {
    try {
        const { submissionID } = req.params;
        const studentID = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(submissionID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid submission ID format" });
        }
        const submission = await ExamSubmission.findOne({ _id: submissionID, studentID })
            .populate("examID", "title duration")
            .lean()
            .exec();

        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Submission not found or unauthorized" });
        }

        // لو الامتحان لسه متصححش، مش هنعرضله المجموع النهائي عشان ميتخضش من درجته الناقصة بتاعت المقالي
        const responseData = {
            ...submission,
            totalScore: submission.status === "GRADED" ? submission.totalScore : "Pending Manual Review"
        };

        res.status(StatusCodes.OK).json({
            message: "Submission result fetched successfully",
            data: responseData
        });
    } catch (err) {
        next(err);
    }
};