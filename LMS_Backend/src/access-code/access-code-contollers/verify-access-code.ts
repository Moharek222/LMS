import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { AccessCode, Status } from "../access-code-model";

export const verifyCodeValidation = [
    body("code")
        .trim()
        .notEmpty().withMessage("Access code is required")
];

interface IRequest {
    code: string;
}

export const verifyAccessCode: RequestHandler<{}, any, IRequest> = async (req, res, next) => {
    try {
        const { code } = req.body;
        const studentId = req.user?.id; 

        const accessCode = await AccessCode.findOne({ code, studentId });

        if (!accessCode) {
            return res.status(StatusCodes.NOT_FOUND).json({
                isValid: false,
                message: "Invalid access code"
            });
        }
        if (accessCode.status === Status.Expired || accessCode.expiresAt <= new Date()) {
            if (accessCode.status !== Status.Expired) {
                accessCode.status = Status.Expired;
                await accessCode.save();
            }

            return res.status(StatusCodes.FORBIDDEN).json({
                isValid: false,
                message: "Access code has expired"
            });
        }
        return res.status(StatusCodes.OK).json({
            isValid: true,
            message: "Access code is valid",
            data: {
                expiresAt: accessCode.expiresAt 
            }
        });

    } catch (error) {
        next(error);
    }
};