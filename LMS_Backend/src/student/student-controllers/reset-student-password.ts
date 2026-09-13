import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Student } from "../student-model";

export const resetPasswordValidation = [
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

export const resetStudentPassword: RequestHandler<{studentID: string}> = async (req, res, next) => {
    try {
        const { studentID } = req.params;
        const { password } = req.body;

        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid student ID format" });
        }

        const student = await Student.findById(studentID).exec();
        
        if (!student || !student.isActive) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Student not found or inactive" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        student.password = hashedPassword;
        student.activeToken = null;
        await student.save();

        return res.status(StatusCodes.OK).json({
            message: "Password reset successfully,and all active sessions have been terminated."
        });
    } catch (err) {
        next(err);
    }
}