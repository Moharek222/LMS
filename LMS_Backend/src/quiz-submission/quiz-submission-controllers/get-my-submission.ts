import { RequestHandler } from "express";
import { QuizSubmission } from "../quiz-submission-model";
import { StatusCodes } from "http-status-codes";

export const getMySubmissionsQuiz: RequestHandler = async (req, res,next) => {
    try {
        const studentID = req.user?.id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const quizSubmissions = await QuizSubmission.find({ studentID  })
        .sort({ createdAt: -1 })
        .populate([
            {
                path: "quizID",
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
        const total = await QuizSubmission.countDocuments({ studentID });
        res.status(StatusCodes.OK).json({
            message: "Quiz submissions fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: quizSubmissions
        })
    }catch (err) {
        next(err);
    }
};