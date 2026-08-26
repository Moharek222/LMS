import { RequestHandler } from "express";
import { body, validationResult } from "express-validator";
import { Student } from "../student/student-model";
import bcrypt from "bcrypt";
import jwtService from "../services/jwt-service";
import { COOKIE_OPTIONS } from "./teacher-login";
import crypto from "crypto";
import { Role } from "../user/user-model";

interface IRequest {
    phone: string;
    password: string;
}

interface IResponse {
    message: string;
    data?: any;
    errors?: any;
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

        res.cookie("token", token, {
            ...COOKIE_OPTIONS,
            maxAge: 2 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const studentObj = student.toObject();
        const { password: _, activeToken: __, ...studentWithoutPassword } = studentObj;

        return res.status(200).json({
            message: "Logged in successfully",
            data: studentWithoutPassword
        });
    } catch (err) {
        next(err);
    }
}