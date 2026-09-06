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

        const student = await Student.findById(studentID)
            .populate("groupID", "name")
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

