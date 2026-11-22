import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission, IStudentAnswer } from "../exam-submission-model";
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

        if (!studentID || !mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid student authentication" });
        }

        const existingSubmission = await ExamSubmission.findOne({ examID, studentID }).lean().exec();
        if (existingSubmission) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "You have already submitted this exam"
            });
        }

        const exam = await Exam.findById(examID).lean().exec();
        if (!exam || !exam.isActive || !exam.isPublished) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found or inactive"
            });
        }

        if (exam.isResultsPublished === true) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Results have already been published. This exam is closed for submissions."
            });
        }

        let mcqScore = 0;
        let totalExamPoints = 0;
        let hasEssay = false;
        const processedAnswers: IStudentAnswer[] = [];

        for (const question of exam.questions) {
            totalExamPoints += question.points;

            const studentAns = studentAnswers.find(
                (answer) => answer.questionID.toString() === question._id?.toString()
            );
            const providedAnswer = studentAns?.studentAnswer || "";

            const questionSnapshot = {
                questionID: question._id as mongoose.Types.ObjectId,
                type: question.type,
                question: question.question,
                questionImage: typeof question.questionImage === "string" ? question.questionImage : undefined,
                points: question.points,
                studentAnswer: providedAnswer
            };

            if (question.type === "MCQ") {
                const isCorrect = providedAnswer === question.answer;
                const earnedScore = isCorrect ? question.points : 0;

                mcqScore += earnedScore;
                processedAnswers.push({
                    ...questionSnapshot,
                    type: "MCQ",
                    options: question.options ? [...question.options] : [],
                    correctAnswer: question.answer || "",
                    score: earnedScore,
                    isCorrect
                });
            } else if (question.type === "ESSAY") {
                hasEssay = true;
                processedAnswers.push({
                    ...questionSnapshot,
                    type: "ESSAY",
                    score: 0,
                    isCorrect: false,
                    teacherFeedback: ""
                });
            }
        }

        const status = hasEssay ? "PENDING" : "GRADED";
        const submission = await ExamSubmission.create({
            examID,
            studentID,
            answers: processedAnswers,
            mcqScore,
            essayScore: 0,
            totalScore: mcqScore,
            totalExamPoints,
            status
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Exam submitted successfully. Results will be announced later.",
            data: {
                submissionID: submission._id
            }
        });
    } catch (err) {
        next(err);
    }
};
