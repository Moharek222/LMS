import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ExamSubmission } from "../exam-submission-model";

export const getMySubmissionsExams: RequestHandler = async (req, res, next) => {
    try {
        const studentID = req.user?.id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const examSubmissions = await ExamSubmission.find({ studentID })
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
        const total = await ExamSubmission.countDocuments({ studentID });
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
};