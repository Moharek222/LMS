import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ExamSubmission } from "../exam-submission-model";
import mongoose from "mongoose";

export const getStudentSubmissions: RequestHandler<{ studentID: string }> = async (req, res, next) => {
    try {
        const studentID = req.params.studentID;
        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            ExamSubmission.find({ studentID })
                .sort({ createdAt: -1 })
                .populate("examID", "title")
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            ExamSubmission.countDocuments({ studentID })
        ]);

        res.status(StatusCodes.OK).json({
            message: "My submissions fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: submissions
        });
    } catch (err) {
        next(err);
    }
};