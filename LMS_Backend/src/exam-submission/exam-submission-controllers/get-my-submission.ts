import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ExamSubmission } from "../exam-submission-model";

export const getMySubmissions: RequestHandler = async (req, res, next) => {
    try {
        const studentID = req.user?.id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            ExamSubmission.find({ studentID })
                .sort({ createdAt: -1 })
                .select("-answers")
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