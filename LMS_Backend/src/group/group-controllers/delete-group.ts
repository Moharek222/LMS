import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Group } from "../group-model";
import { Student } from "../../student/student-model";


export const deleteGroup: RequestHandler<{ groupID: string }> = async (req, res) => {
    try {
        const { groupID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID format"
            });
            return;
        }
        const deletedGroup = await Group.findOneAndUpdate(
            { _id: groupID, isActive: true },
            { $set: { isActive: false } },
            { returnDocument: 'after' }
        );

        if (!deletedGroup) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Group not found or already deleted"
            });
            return;
        }
        const studentsResult = await Student.updateMany(
            { 
                groupID: groupID,
                isActive: true
            },
            { 
                $set: { isActive: false },
                $unset: { group: "" }
            }
        );

        res.status(StatusCodes.OK).json({
            message: "Group archived and its students have been deactivated successfully",
            data: {
                group: deletedGroup,
                affectedStudentsCount: studentsResult.modifiedCount
            }
        });
    } catch (err) {
        console.log("Delete Group Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};