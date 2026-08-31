import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Attendance } from "../attendance-model";

export const getAttendanceById: RequestHandler<{ attendanceID: string }> = async (req, res, next) => {
    try {
        const { attendanceID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(attendanceID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: "Invalid attendance ID format" 
            });
        }

        const attendance = await Attendance.findById(attendanceID)
            .populate("presentStudents", "name phone")
            .lean()
            .exec();

        if (!attendance) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Attendance record not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Attendance details fetched successfully",
            totalPresent: attendance.presentStudents.length,
            data: attendance
        });
    } catch (err) {
        next(err);
    }
};