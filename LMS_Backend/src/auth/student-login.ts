import { RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import { Student } from "../student/student-model";
import bcrypt from "bcrypt";
import jwtService from "../services/jwt-service";
import crypto from "crypto";
import { Role } from "../user/user-model";
import { AccessCode, Status } from "../access-code/access-code-model";

interface IRequest {
    phone: string;
    password: string;
}
interface IResponse {
    message: string;
    token?: string;
    refreshToken?: string;
    data?: any;
}

export const loginValidation = [
    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required"),
    body("password")
        .notEmpty().withMessage("Password is required"),
];

export const studentLogin: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        const student = await Student.findOne({ phone }).select("+password").exec();

        if (!student || !student.password) {
            return res.status(401).json({ message: "Invalid phone number or password" });
        }
        if (!student.isActive) {
            return res.status(403).json({ message: "Your account has been deactivated. Please contact the Teacher." });
        }

        const validPassword = await bcrypt.compare(password, student.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid phone number or password" });
        }

        const sessionToken = crypto.randomUUID();
        student.activeToken = sessionToken;
        await student.save();

        const token = jwtService.createToken(
            { id: student._id, phone: student.phone, role: Role.Student, sessionId: sessionToken },
            { expiresIn: "2h" }
        );

        const refreshToken = jwtService.createToken(
            { id: student._id, phone: student.phone, role: Role.Student, sessionId: sessionToken },
            { expiresIn: "7d" }
        );


        const studentObj = student.toObject();
        const { password: _, activeToken: __, ...studentWithoutPassword } = studentObj;

        const activeCode = await AccessCode.findOne({
            studentID: student._id,
            status: Status.Active
        });

        let hasActiveSubscription = false;

        if (activeCode) {
            if (activeCode.expiresAt <= new Date()) {
                activeCode.status = Status.Expired;
                await activeCode.save();
            } else {
                hasActiveSubscription = true;
            }
        }
        return res.status(200).json({
            message: "Logged in successfully",
            token,
            refreshToken,
            data: {
                ...studentWithoutPassword,
                hasActiveSubscription
            }
        });
    } catch (err) {
        next(err);
    }
}