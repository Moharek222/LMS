import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Attendance } from "../attendance-model";
import { Group } from "../../group/group-model";

export const scanAttendanceValidation = [
    body("studentID")
        .notEmpty().withMessage("Student ID is required")
        .isMongoId().withMessage("Invalid Student ID format")
];

export const scanStudentAttendance: RequestHandler<{ groupID: string }, {}, { studentID: string }> = async (req, res, next) => {
    try {
        const { groupID } = req.params;
        const { studentID } = req.body;

        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid group ID format" });
        }

        const groupExists = await Group.findById(groupID).lean().exec();
        if (!groupExists) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Group not found" });
        }

        const today = new Date(new Date().setHours(0, 0, 0, 0));

        const attendance = await Attendance.findOneAndUpdate(
            { groupID, date: today },
            { $addToSet: { presentStudents: studentID } },
            { new: true, upsert: true } 
        ).populate("presentStudents", "name");

        res.status(StatusCodes.OK).json({
            message: "Student attendance recorded successfully",
            data: attendance
        });
    } catch (err) {
        next(err);
    }
};