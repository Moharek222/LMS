import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission } from "../exam-submission-model";

export const submitExamValidation = [
    body("selectedOption")
        .notEmpty().withMessage("Options are required")
        .isArray({ min: 1 }).withMessage("You must submit at least one answer"),

    body("selectedOption.*.QuestionId")
        .notEmpty().withMessage("QuestionId is required")
        .isMongoId().withMessage("Invalid QuestionId format"),

    body("selectedOption.*.selectedAnswer")
        .trim()
        .notEmpty().withMessage("Answer is required")
        .isString().withMessage("Answer must be a string")
];

interface ISelectedOption {
    QuestionId: string;
    selectedAnswer: string
}

interface IRequest {
    selectedOption: ISelectedOption[];
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const submitExam: RequestHandler<{ examID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { examID } = req.params;
        const studentID = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }
        const existingSubmission = await ExamSubmission.findOne({ studentID, examID }).lean().exec();
        if (existingSubmission) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "You have already submitted this exam"
            });
        }
        const exam = await Exam.findById(examID).lean().exec();
        if (!exam || !exam.isActive) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "exam not found or not active"
            });
        }

        const { selectedOption } = req.body;
        let score = 0;
        const totalQuestions = exam.questions.length;

        selectedOption.forEach(studentAnswer => {
            const actualQuestion = exam.questions.find(
                q => q._id?.toString() === studentAnswer.QuestionId.toString()
            );
            if (actualQuestion && actualQuestion.answer === studentAnswer.selectedAnswer) {
                score += 1;
            }
        });
        const submission = await ExamSubmission.create({
            studentID,
            examID,
            selectedOption,
            score,
            isPassed: score >= totalQuestions / 2 ? true : false
        });

        res.status(StatusCodes.CREATED).json({
            message: "exam submitted successfully",
            data: {
                score, 
                totalQuestions, 
                isPassed: score >= totalQuestions / 2 ? true : false,
                submissionId: submission._id
            }
        });

    } catch (err) {
        next(err);
    }
};