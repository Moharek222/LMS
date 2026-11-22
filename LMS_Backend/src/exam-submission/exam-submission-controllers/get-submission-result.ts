import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission } from "../exam-submission-model";

export const getSubmissionResult: RequestHandler<{ submissionID: string }> = async (req, res, next) => {
    try {
        const { submissionID } = req.params;
        const studentID = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(submissionID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid submission ID format" });
        }

        if (!studentID || !mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid student authentication" });
        }

        const submission = await ExamSubmission.findOne({ _id: submissionID, studentID })
            .lean()
            .exec();

        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Submission not found or unauthorized" });
        }

        const exam = await Exam.findById(submission.examID)
            .select("title duration isResultsPublished questions")
            .lean()
            .exec();

        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Exam not found" });
        }

        if (exam.isResultsPublished !== true || submission.status !== "GRADED") {
            return res.status(StatusCodes.OK).json({
                message: "Results are not available yet.",
                data: { resultsPublished: false }
            });
        }

        const examQuestionsByID = new Map(
            exam.questions.map((question) => [question._id.toString(), question])
        );

        const answers = submission.answers.map((answer: any) => {
            const currentExamQuestion = examQuestionsByID.get(answer.questionID.toString());
            const savedQuestionSnapshot = typeof answer.question === "string" && answer.question.length > 0;

            const commonAnswerData = {
                questionID: answer.questionID,
                type: answer.type,
                question: savedQuestionSnapshot ? answer.question : currentExamQuestion?.question,
                questionImage: savedQuestionSnapshot ? answer.questionImage : currentExamQuestion?.questionImage,
                studentAnswer: answer.studentAnswer,
                points: typeof answer.points === "number" ? answer.points : currentExamQuestion?.points,
                earnedScore: answer.score,
                isCorrect: answer.isCorrect === true,
                questionSnapshotAvailable: savedQuestionSnapshot
            };

            if (answer.type === "MCQ") {
                return {
                    ...commonAnswerData,
                    options: savedQuestionSnapshot ? answer.options : currentExamQuestion?.options,
                    correctAnswer: savedQuestionSnapshot ? answer.correctAnswer : undefined
                };
            }

            return {
                ...commonAnswerData,
                teacherFeedback: answer.teacherFeedback || ""
            };
        });

        return res.status(StatusCodes.OK).json({
            message: "Submission result fetched successfully",
            data: {
                submissionID: submission._id,
                examID: {
                    _id: exam._id,
                    title: exam.title,
                    duration: exam.duration
                },
                status: submission.status,
                mcqScore: submission.mcqScore,
                essayScore: submission.essayScore,
                totalScore: submission.totalScore,
                totalExamPoints: submission.totalExamPoints,
                resultsPublished: true,
                createdAt: submission.createdAt,
                answers
            }
        });
    } catch (err) {
        next(err);
    }
};
