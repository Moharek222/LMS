import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Progress } from "../progress-model";

export const markLessonAsWatched: RequestHandler = async (req, res, next) => {
    try {
        const studentID = req.user?.id;
        const { courseID, lessonID } = req.body;
        await Progress.findOneAndUpdate(
            { studentID, courseID },
            { $addToSet: { watchedLessons: lessonID } },
            {  returnDocument:"after",upsert: true  }
        );

        res.status(StatusCodes.OK).json({
            message: "Lesson marked as watched successfully"
        });
    } catch (err) {
        next(err);
    }
};