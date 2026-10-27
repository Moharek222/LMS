
import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import mongoose from "mongoose";
import { AccessCode, Status } from "../../access-code/access-code-model";
import { Student } from "../../student/student-model";

export const generateGroupCodesValidation = [
    body("studentIDs")
        .isArray({ min: 1 })
        .withMessage("Student IDs must be a non-empty array"),

    body("studentIDs.*")
        .notEmpty()
        .withMessage("Student ID is required")
        .isMongoId()
        .withMessage("Invalid Student ID format")
];

interface IRequest {
    studentIDs: string[];
}

interface IGeneratedCode {
    studentID: mongoose.Types.ObjectId;
    code: string;
    expiresAt: Date;
}

interface IResponse {
    message: string;
    data?: unknown;
}
const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRandomCode = (): string => {
    const bytes = crypto.randomBytes(8);

    return Array.from(bytes)
        .map(byte => CHARACTERS[byte % CHARACTERS.length])
        .join("");
};

export const generateGroupAccessCodes: RequestHandler<
    {},
    IResponse,
    IRequest
> = async (req, res, next) => {
    try {
        const { studentIDs } = req.body;

        const uniqueStudentIDs = [...new Set(studentIDs)];
        const students = await Student.find({
            _id: { $in: uniqueStudentIDs }
        }).select("_id");

        const existingStudentIDs = new Set(
            students.map(student => student._id.toString())
        );

        const generated: IGeneratedCode[] = [];
        const skipped: { studentID: string; reason: string }[] = [];

        const now = new Date();

        for (const studentID of uniqueStudentIDs) {
            if (!existingStudentIDs.has(studentID)) {
                skipped.push({
                    studentID,
                    reason: "Student not found"
                });
                continue;
            }

            const existingActiveCode = await AccessCode.findOne({
                studentID,
                status: Status.Active,
                expiresAt: { $gt: now },
                revokedAt: null
            });

            if (existingActiveCode) {
                skipped.push({
                    studentID,
                    reason: "Student already has an active subscription"
                });
                continue;
            }

            const codeString = generateRandomCode();

            try {
                const accessCode = await AccessCode.create({
                    studentID,
                    code: codeString
                });

                generated.push({
                    studentID: accessCode.studentID,
                    code: accessCode.code,
                    expiresAt: accessCode.expiresAt
                });
            } catch (error: any) {
                if (error.code === 11000) {
                    skipped.push({
                        studentID,
                        reason: "Code collision occurred"
                    });
                    continue;
                }

                throw error;
            }
        }

        return res.status(StatusCodes.CREATED).json({
            message: "Group access codes generation completed",
            data: {
                generated,
                skipped
            }
        });

    } catch (error) {
        next(error);
    }
};