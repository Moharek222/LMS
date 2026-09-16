import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Progress } from "../progress-model";

export const getStudentWatchHistory: RequestHandler<{ studentID: string }> = async (req, res, next) => {
    try {
        const { studentID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid student ID" });
        }

        const history = await Progress.find({ studentID })
            .populate("courseID", "title") 
            .populate("watchedLessons", "title")
            .lean()
            .exec();

        res.status(StatusCodes.OK).json({
            message: "Student watch history fetched successfully",
            data: history
        });
    } catch (err) {
        next(err);
    }
};