import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Group } from "../group-model";
import { Grade } from "../../interfaces/grade";
import { Student } from "../../student/student-model";



export const updateGroupValidation = [
    body("name")
        .optional()
        .isString().withMessage("Name must be a string")
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean"),

    body("grade")
        .optional()
        .isIn(Object.values(Grade)).withMessage("Invalid grade")
]

interface IRequest {
    name?: string,
    grade?: Grade,
    isActive?: boolean
}
interface IResponse {
    message: string,
    data?: any
}

export const updateGroup: RequestHandler<
    { groupID: string },
    IResponse,
    IRequest
> = async (req, res) => {
    try {
        const { groupID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID",
            });
        }

        const { name, isActive, grade } = req.body;

        const updateData: Partial<IRequest> = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (typeof isActive === "boolean") {
            updateData.isActive = isActive;
        }
        if (
            name === undefined &&
            isActive === undefined &&
            grade === undefined
        ) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update",
            });
        }

        const currentGroup = await Group.findById(groupID)
            .select("grade")
            .lean()
            .exec();

        if (!currentGroup) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Group not found",
            });
        }

        if (grade !== undefined) {
            if (grade !== currentGroup.grade) {
                const studentsCount = await Student.countDocuments({
                    groupID: currentGroup._id,
                });

                if (studentsCount > 0) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        message:
                            "Cannot change group grade while students are assigned to it",
                    });
                }
            }

            updateData.grade = grade;
        }

        const group = await Group.findOneAndUpdate(
            { _id: groupID },
            { $set: updateData },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Group not found",
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Group updated successfully",
            data: group,
        });
    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Group name already exists",
            });
        }

        console.error("Update Group Error:", err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
        });
    }
};