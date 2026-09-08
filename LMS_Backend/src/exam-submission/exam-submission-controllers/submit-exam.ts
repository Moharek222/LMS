import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission , IStudentAnswer } from "../exam-submission-model";
import { body } from "express-validator";

export const submitExamValidation = [
    body("answers")
        .notEmpty().withMessage("Answers are required")
        .isArray({ min: 1 }).withMessage("Answers must be an array with at least one answer"),

    body("answers.*.questionID")
        .notEmpty().withMessage("Question ID is required")
        .isMongoId().withMessage("Invalid question ID format"),

    body("answers.*.type")
        .notEmpty().withMessage("Question type is required")
        .isIn(["MCQ", "ESSAY"]).withMessage("Type must be MCQ or ESSAY"),

    body("answers.*.studentAnswer")
        .optional({ checkFalsy: true })
        .isString().withMessage("Student answer must be a string"),
];

interface IAnswer {
    questionID: string;
    type: "MCQ" | "ESSAY";
    studentAnswer: string;
}

interface IRequest {
    answers: IAnswer[];
}

export const submitExam: RequestHandler<{ examID: string }, {}, IRequest> = async (req, res, next) => {
    try {
        const { examID } = req.params;
        const studentID = req.user?.id;
        const { answers: studentAnswers } = req.body;

        if (!mongoose.Types.ObjectId.isValid(examID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid exam ID format" });
        }

        const existingSubmission = await ExamSubmission.findOne({ examID, studentID }).lean().exec();
        if (existingSubmission) {
            return res.status(StatusCodes.CONFLICT).json({ 
                message: "You have already submitted this exam" 
            });
        }
        const exam = await Exam.findById(examID).lean().exec();
        if (!exam || !exam.isActive) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: "Exam not found or inactive" 
            });
        }
        let mcqScore = 0;
        let totalExamPoints = 0;
        let hasEssay = false;
        const processedAnswers:IStudentAnswer[] = [];

        for (const question of exam.questions) {
            totalExamPoints += question.points;

            const studentAns = studentAnswers.find(
                (a) => a.questionID.toString() === question._id?.toString()
            );
            const providedAnswer = studentAns?.studentAnswer || "";

            if (question.type === "MCQ") {
                const isCorrect = providedAnswer === question.answer;
                const earnedScore = isCorrect ? question.points : 0;
                
                mcqScore += earnedScore;

                processedAnswers.push({
                    questionID: question._id as mongoose.Types.ObjectId,
                    type: "MCQ",
                    studentAnswer: providedAnswer,
                    score: earnedScore,
                    isCorrect: isCorrect
                });
            } 
            else if (question.type === "ESSAY") {
                hasEssay = true;
                
                processedAnswers.push({
                    questionID: question._id as mongoose.Types.ObjectId,
                    type: "ESSAY",
                    studentAnswer: providedAnswer,
                    score: 0, 
                    isCorrect: false,
                    teacherFeedback: ""
                });
            }
        }

        const status = hasEssay ? "PENDING" : "GRADED";
        const totalScore = mcqScore;
        const submission = await ExamSubmission.create({
            examID,
            studentID,
            answers: processedAnswers,
            mcqScore,
            essayScore: 0,
            totalScore,
            totalExamPoints,
            status
        });

        res.status(StatusCodes.CREATED).json({
            message: hasEssay 
                ? "Exam submitted successfully. Pending manual review for essay questions."
                : "Exam submitted and graded successfully.",
            data: {
                submissionID: submission._id,
                status: submission.status,
                totalScore: status === "GRADED" ? submission.totalScore : undefined,
                totalExamPoints: submission.totalExamPoints
            }
        });

    } catch (err) {
        next(err);
    }
};