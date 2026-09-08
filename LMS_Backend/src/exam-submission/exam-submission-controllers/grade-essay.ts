import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
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

        const submission = await ExamSubmission.findById(submissionID);
        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Submission not found" });
        }
        grades.forEach((gradeInput) => {
            const answer = submission.answers.find(
                (ans) => ans.questionID.toString() === gradeInput.questionID && ans.type === "ESSAY"
            );
            if (answer) {
                answer.score = gradeInput.score;
                if (gradeInput.teacherFeedback !== undefined) {
                    answer.teacherFeedback = gradeInput.teacherFeedback;
                }
            }
        });
        const newEssayScore = submission.answers
            .filter((ans) => ans.type === "ESSAY")
            .reduce((sum, ans) => sum + ans.score, 0);
        submission.essayScore = newEssayScore;
        submission.totalScore = submission.mcqScore + newEssayScore;
        submission.status = "GRADED";
        submission.gradedBy = new mongoose.Types.ObjectId(teacherID);
        submission.markModified("answers");

        await submission.save();

        res.status(StatusCodes.OK).json({
            message: "Essay questions graded and submission finalized successfully",
            data: submission
        });

    } catch (err) {
        next(err);
    }
};