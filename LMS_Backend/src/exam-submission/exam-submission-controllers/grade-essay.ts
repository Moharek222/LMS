import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../../exam/exam-model";
import { ExamSubmission } from "../exam-submission-model";

interface IGrade {
    questionID: string;
    score: number;
    teacherFeedback?: string;
}

interface IRequest {
    grades: IGrade[];
}

export const gradeEssayQuestions: RequestHandler<{ submissionID: string }, any, IRequest> = async (req, res, next) => {
    try {
        const { submissionID } = req.params;
        const { grades } = req.body;
        const teacherID = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(submissionID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid submission ID format" });
        }

        if (!teacherID || !mongoose.Types.ObjectId.isValid(teacherID)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid teacher authentication" });
        }

        if (!Array.isArray(grades) || grades.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Grades must be a non-empty array"
            });
        }

        const submission = await ExamSubmission.findById(submissionID);
        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Submission not found" });
        }

        const exam = await Exam.findById(submission.examID).select("questions isResultsPublished").exec();
        if (!exam) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Exam not found" });
        }

        if (exam.isResultsPublished === true) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "This exam's results have already been published. Unpublish the results before changing grades."
            });
        }

        const essayAnswers = submission.answers.filter((answer) => answer.type === "ESSAY");
        if (essayAnswers.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "This submission has no essay questions to grade"
            });
        }

        const essayQuestionIDs = new Set(essayAnswers.map((answer) => answer.questionID.toString()));
        const receivedQuestionIDs = new Set<string>();

        for (const gradeInput of grades) {
            if (
                !gradeInput ||
                typeof gradeInput.questionID !== "string" ||
                !mongoose.Types.ObjectId.isValid(gradeInput.questionID)
            ) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid question ID in grades" });
            }

            if (receivedQuestionIDs.has(gradeInput.questionID)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Duplicate grade submitted for question ${gradeInput.questionID}`
                });
            }
            receivedQuestionIDs.add(gradeInput.questionID);

            if (!essayQuestionIDs.has(gradeInput.questionID)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Question ${gradeInput.questionID} is not an essay question in this submission`
                });
            }

            if (typeof gradeInput.score !== "number" || !Number.isFinite(gradeInput.score) || gradeInput.score < 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid score for question ${gradeInput.questionID}`
                });
            }

            if (gradeInput.teacherFeedback !== undefined && typeof gradeInput.teacherFeedback !== "string") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid teacher feedback for question ${gradeInput.questionID}`
                });
            }
        }

        const missingQuestionIDs = [...essayQuestionIDs].filter((questionID) => !receivedQuestionIDs.has(questionID));
        if (missingQuestionIDs.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "All essay questions must be graded before finalizing the submission.",
                missingQuestionIDs
            });
        }

        for (const gradeInput of grades) {
            const examQuestion = exam.questions.find(
                (question) => question._id?.toString() === gradeInput.questionID
            );

            if (!examQuestion) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Question ${gradeInput.questionID} was not found in the exam`
                });
            }

            if (gradeInput.score > examQuestion.points) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Score for question ${gradeInput.questionID} cannot exceed ${examQuestion.points}`
                });
            }
        }

        for (const gradeInput of grades) {
            const answer = submission.answers.find(
                (item) => item.questionID.toString() === gradeInput.questionID && item.type === "ESSAY"
            );

            if (answer) {
                answer.score = gradeInput.score;
                if (gradeInput.teacherFeedback !== undefined) {
                    answer.teacherFeedback = gradeInput.teacherFeedback;
                }
            }
        }

        submission.essayScore = submission.answers
            .filter((answer) => answer.type === "ESSAY")
            .reduce((sum, answer) => sum + answer.score, 0);
        submission.totalScore = submission.mcqScore + submission.essayScore;
        submission.status = "GRADED";
        submission.gradedBy = new mongoose.Types.ObjectId(teacherID);
        submission.markModified("answers");

        await submission.save();

        return res.status(StatusCodes.OK).json({
            message: "All essay questions graded and submission finalized successfully",
            data: submission
        });
    } catch (err) {
        next(err);
    }
};
