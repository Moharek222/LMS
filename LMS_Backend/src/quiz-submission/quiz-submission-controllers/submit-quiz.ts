import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Quiz } from "../../quiz/quiz-model";
import { QuizSubmission } from "../quiz-submission-model";

export const submitQuizValidation = [
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

interface ISelectedOption{
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

export const submitQuiz: RequestHandler<{ quizID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { quizID } = req.params;
        const studentID = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(quizID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid quiz ID format"
            });
        }
        const existingSubmission = await QuizSubmission.findOne({ studentID, quizID }).lean().exec();
        if (existingSubmission) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "You have already submitted this quiz"
            });
        }
        const quiz = await Quiz.findById(quizID).lean().exec();
        if (!quiz || !quiz.isActive) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Quiz not found or not active"
            });
        }

        const { selectedOption } = req.body;
        let score = 0;
        const totalQuestions = quiz.questions.length;

        selectedOption.forEach(studentAnswer => {
            const actualQuestion = quiz.questions.find(
                q => q._id?.toString() === studentAnswer.QuestionId.toString()
            );
            if (actualQuestion && actualQuestion.answer === studentAnswer.selectedAnswer) {
                score += 1;
            }
        });
        const passingPercentage = quiz.passingPercentage;
        const studentPercentage = (score / totalQuestions) * 100;
        const isPassed = studentPercentage >= passingPercentage;
        const submission = await QuizSubmission.create({
            studentID,
            quizID,
            selectedOption,
            score,
            isPassed
        });

        res.status(StatusCodes.CREATED).json({
            message: "Quiz submitted successfully",
            data: {
                score, 
                totalQuestions, 
                isPassed,
                submissionId: submission._id
            }
        });

    } catch (err) {
        next(err);
    }
};