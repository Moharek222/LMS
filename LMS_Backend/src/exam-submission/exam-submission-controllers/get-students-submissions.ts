import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ExamSubmission } from "../exam-submission-model";


export const getStudentsSubmissions: RequestHandler<{ examID: string }> = async (req, res, next) => {
    try {
        const examID = req.params.examID;
        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const examSubmissions = await ExamSubmission.find({ examID })
            .sort({ createdAt: -1 })
            .populate([
                {
                    path: "examID",
                    select: "title"
                },
                {
                    path: "studentID",
                    select: "name"
                }
            ])
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();
        const total = await ExamSubmission.countDocuments({ examID });
        res.status(StatusCodes.OK).json({
            message: "exam submissions fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: examSubmissions
        })
    } catch (err) {
        next(err);
    }
}