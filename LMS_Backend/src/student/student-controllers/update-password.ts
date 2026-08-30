import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { Student } from "../student-model";

export const updatePasswordValidation = [
    body("oldPassword")
        .notEmpty().withMessage("Old password is required")
        .isString().withMessage("Old password must be a string"),
        
    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isString().withMessage("New password must be a string")
        .isLength({ min: 4 }).withMessage("New password must be at least 4 characters long")
];

interface IRequest {
    oldPassword?: string;
    newPassword?: string;
}

interface IResponse {
    message: string;
}

export const updatePassword: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const studentID = req.user?.id;

        if (!studentID) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized"
            });
        }

        const { oldPassword, newPassword } = req.body;

        // Fetch student and explicitly select password since it has select: false
        const student = await Student.findById(studentID).select("+password").exec();

        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword!, student.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Incorrect old password"
            });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword!, 10);
        student.password = hashedPassword;
        await student.save();

        res.status(StatusCodes.OK).json({
            message: "Password updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

