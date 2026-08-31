import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Student } from "../student-model";

interface IResponse {
    message: string;
    data?: unknown;
}

export const getProfile: RequestHandler<{}, IResponse> = async (req, res, next) => {
    try {
        const studentID = req.user?.id;

        if (!studentID) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized"
            });
        }

        const student = await Student.findById(studentID)
            .populate([
                {
                    path: "groupID",
                    select: "name"
                },
                {
                    path: "parentID",
                    select: "name"
                }
            ])
            .lean()
            .exec();

        if (!student || !student.isActive) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student profile not found or account is deactivated"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Profile fetched successfully",
            data: student
        });
    } catch (err) {
        next(err);
    }
};

