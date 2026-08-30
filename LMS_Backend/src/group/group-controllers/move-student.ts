import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Group } from "../group-model";
import { Student } from "../../student/student-model";

export const moveStudentValidation = [
    body("newGroupID")
        .notEmpty().withMessage("New Group ID is required")
        .isMongoId().withMessage("Invalid New Group ID format")
];

interface IRequest {
    newGroupID: string;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const moveStudent: RequestHandler<{ studentID: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { studentID } = req.params;
        const { newGroupID } = req.body;

        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid Student ID format"
            });
        }

        const student = await Student.findById(studentID).exec();
        if (!student || !student.isActive) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }
        const group = await Group.findById(newGroupID).lean().exec();
        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "New Group not found"
            });
        }
        if (!group.isActive) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Cannot move student to an inactive group"
            });
        }

        if (student.groupID.toString() === newGroupID) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Student is already in this group"
            });
        }

        // Update the student's group
        student.groupID = new mongoose.Types.ObjectId(newGroupID);
        await student.save();

        res.status(StatusCodes.OK).json({
            message: "Student moved to the new group successfully",
            data: {
                studentID: student._id,
                name: student.name,
                newGroupID: group._id,
                newGroupName: group.name
            }
        });

    } catch (err) {
        next(err);
    }
};

