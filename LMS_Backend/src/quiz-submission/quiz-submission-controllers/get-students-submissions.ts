import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { QuizSubmission } from "../quiz-submission-model";
import mongoose from "mongoose";


export const getStudentsSubmissions: RequestHandler<{quizID: string}> = async (req, res, next) => {
    try{
        const quizID = req.params.quizID;
        if (!mongoose.Types.ObjectId.isValid(quizID)) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid quiz ID format"
                    });
                }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const quizSubmissions = await QuizSubmission.find({ quizID  })
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
        const total = await QuizSubmission.countDocuments({ quizID  });
        res.status(StatusCodes.OK).json({
            message: "Quiz submissions fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: quizSubmissions
        })
    }catch(err){
        next(err);
    } 
}