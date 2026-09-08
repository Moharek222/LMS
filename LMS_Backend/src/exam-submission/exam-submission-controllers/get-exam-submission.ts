import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ExamSubmission } from "../exam-submission-model";


export const getExamSubmission: RequestHandler<{ examID: string }> = async (req, res, next) => {
    try {
        const { examID } = req.params;
        const findObj: any = {};
        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        } else {
            findObj.examID = examID;
        }

        const status = req.query.status;
        if (status && (status === "PENDING" || status === "GRADED")) {
            findObj.status = status;
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);

        const [examSubmissions, total] = await Promise.all([
            ExamSubmission.find(findObj)
                .select("-answer")
                .sort({ createdAt: -1 })
                .populate([
                    { path: "examID", select: "title" },
                    { path: "studentID", select: "name" },
                    { path: "gradedBy", select: "name" }
                ])
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            ExamSubmission.countDocuments(findObj)
        ]);
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