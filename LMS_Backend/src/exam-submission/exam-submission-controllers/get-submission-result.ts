import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission } from "../exam-submission-model";

export const getSubmissionResult: RequestHandler<{ submissionID: string }> = async (req, res, next) => {
    try {
        const { submissionID } = req.params;
        const studentID = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(submissionID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid submission ID format" });
        }

        if (!studentID || !mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid student authentication" });
        }

        const submission = await ExamSubmission.findOne({ _id: submissionID, studentID })
            .lean()
            .exec();

        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Submission not found or unauthorized" });
        }

        const exam = await Exam.findById(submission.examID)
            .select("title duration isResultsPublished")
            .lean()
            .exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Exam not found" });
        }

        if (exam.isResultsPublished !== true || submission.status !== "GRADED") {
            return res.status(StatusCodes.OK).json({
                message: "Results are not available yet.",
                data: {
                    resultsPublished: false
                }
            });
        }

        const responseData = {
            ...submission,
            examID: {
                _id: exam._id,
                title: exam.title,
                duration: exam.duration
            },
            resultsPublished: true
        };

        return res.status(StatusCodes.OK).json({
            message: "Submission result fetched successfully",
            data: responseData
        });
    } catch (err) {
        next(err);
    }
};
