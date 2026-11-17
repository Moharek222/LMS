import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission } from "../exam-submission-model";

export const publishExamResults: RequestHandler<{ examID: string }> = async (req, res, next) => {
    try {
        const { examID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid exam ID format" });
        }

        const exam = await Exam.findById(examID);
        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Exam not found" });
        }

        if (exam.isResultsPublished === true) {
            return res.status(StatusCodes.OK).json({
                message: "Exam results have already been published.",
                data: {
                    examID: exam._id,
                    isResultsPublished: true
                }
            });
        }

        const pendingSubmissions = await ExamSubmission.countDocuments({
            examID,
            status: "PENDING"
        });

        if (pendingSubmissions > 0) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Cannot publish results while there are submissions awaiting essay grading.",
                data: {
                    pendingSubmissions
                }
            });
        }

        exam.isResultsPublished = true;
        exam.isAvailable = false;
        await exam.save();

        return res.status(StatusCodes.OK).json({
            message: "Exam results published successfully.",
            data: {
                examID: exam._id,
                isResultsPublished: true,
                isAvailable: false
            }
        });
    } catch (err) {
        next(err);
    }
};
