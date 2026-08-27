import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { AccessCode, Status } from "../../access-code/access-code-model";
import { Student } from "../../student/student-model";

export const generateCodeValidation = [
    body("studentID")
        .notEmpty().withMessage("Student ID is required")
        .isMongoId().withMessage("Invalid Student ID format")
];

interface IRequest {
    studentID: string;
}

interface IResponse {
    message: string;
    data?: any;
}

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRandomCode = () => {
    const bytes = crypto.randomBytes(8);

    return Array.from(bytes)
        .map(byte => CHARACTERS[byte % CHARACTERS.length])
        .join("");
};

export const generateStudentAccessCode: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { studentID } = req.body;
        const student = await Student.findById(studentID);
        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }

        const existingActiveCode = await AccessCode.findOne({
            studentID: student._id,
            status: Status.Active,
            expiresAt: { $gt: new Date() }
        });

        if (existingActiveCode) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Student already has an active subscription",
                data: {
                    code: existingActiveCode.code,
                    expiresAt: existingActiveCode.expiresAt
                }
            });
        }

        const codeString = generateRandomCode();

        const accessCode = await AccessCode.create({
            studentID: student._id,
            code: codeString
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Access code generated successfully for the student",
            data: {
        code: accessCode.code,
        expiresAt: accessCode.expiresAt
    }
        });

    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Code collision occurred. Please try again."
            });
        }
        next(err);
    }
};