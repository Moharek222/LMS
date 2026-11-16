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
                .populate({ path: "examID", select: "title isResultsPublished" })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            ExamSubmission.countDocuments({ studentID })
        ]);

        // This endpoint is not currently registered in the router, but keep it safe if enabled later.
        const safeSubmissions = submissions.map((submission: any) => {
            const resultsPublished =
                submission.status === "GRADED" && submission.examID?.isResultsPublished === true;

            const safeSubmission: any = {
                ...submission,
                examID: submission.examID
                    ? { _id: submission.examID._id, title: submission.examID.title }
                    : submission.examID,
                resultsPublished
            };

            if (!resultsPublished) {
                delete safeSubmission.mcqScore;
                delete safeSubmission.essayScore;
                delete safeSubmission.totalScore;
                delete safeSubmission.totalExamPoints;
            }

            return safeSubmission;
        });

        res.status(StatusCodes.OK).json({
            message: "My submissions fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: safeSubmissions
        });
    } catch (err) {
        next(err);
    }
};
