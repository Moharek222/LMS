import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ExamSubmission } from "../exam-submission-model";

export const getExamStatistics: RequestHandler<{ examID: string }> = async (req, res, next) => {
    try {
        const { examID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid exam ID format" });
        }

        const stats = await ExamSubmission.aggregate([
            { $match: { examID: new mongoose.Types.ObjectId(examID) } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    pendingSubmissions: { 
                        $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } 
                    },
                    gradedSubmissions: { 
                        $sum: { $cond: [{ $eq: ["$status", "GRADED"] }, 1, 0] } 
                    },
                    averageScore: { 
                        $avg: { $cond: [{ $eq: ["$status", "GRADED"] }, "$totalScore", null] } 
                    },
                    highestScore: { 
                        $max: { $cond: [{ $eq: ["$status", "GRADED"] }, "$totalScore", null] } 
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSubmissions: 1,
                    pendingSubmissions: 1,
                    gradedSubmissions: 1,
                    averageScore: { $round: ["$averageScore", 2] },
                    highestScore: 1
                }
            }
        ]);

        res.status(StatusCodes.OK).json({
            message: "Exam statistics fetched successfully",
            data: stats[0] || {
                totalSubmissions: 0,
                pendingSubmissions: 0,
                gradedSubmissions: 0,
                averageScore: 0,
                highestScore: 0
            }
        });
    } catch (err) {
        next(err);
    }
};