import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import { Student } from "../student-model";

export const updateProfileValidation = [
    body("name")
        .optional()
        .trim()
        .isString().withMessage("Name must be a string")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),

    body("parentPhone")
        .optional()
        .trim()
        .isString().withMessage("Parent phone must be a string"),

    body("phone")
        .optional()
        .trim()
        .isString().withMessage("Phone must be a string")
];

interface IRequest {
    name?: string;
    parentPhone?: string;
    phone?: string;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateProfile: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const studentID = req.user?.id;

        if (!studentID) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized"
            });
        }

        const { name, parentPhone, phone } = req.body;
        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (parentPhone !== undefined) updateData.parentPhone = parentPhone;
        if (phone !== undefined) {
            const phoneExists = await Student.findOne({ phone, _id: { $ne: studentID } }).lean().exec();
            if (phoneExists) {
                return res.status(StatusCodes.CONFLICT).json({
                    message: "Phone number is already in use by another account"
                });
            }
            updateData.phone = phone;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentID,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!updatedStudent) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Profile updated successfully",
            data: updatedStudent
        });
    } catch (err) {
        next(err);
    }
};

