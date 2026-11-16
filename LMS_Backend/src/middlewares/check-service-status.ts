import { RequestHandler } from "express";
import { Role } from "../user/user-model";
import { UserToken } from "../interfaces/user-token";
import jwtService from "../services/jwt-service";

export const checkServiceStatus: RequestHandler = (req, res, next) => {
    const isSuspended = process.env.SERVICE_SUSPENDED === "true";
    if (!isSuspended) {
        return next();
    }

    const allowedLoginRoutes = [
        "/api/auth/teacher-login",
        "/api/auth/student-login",
    ];

    if (req.method === "POST" && allowedLoginRoutes.includes(req.path)) {
        return next();
    }

    let token: string | undefined;

    if (req.method === "POST" && req.path === "/api/auth/refresh") {
        token = req.body?.refreshToken;
    } else {
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }

    const decoded = token
        ? jwtService.verifyToken<UserToken>(token)
        : null;

    const allowedStudentID =
        process.env.SERVICE_ALLOWED_STUDENT_ID?.trim();

    const isAllowedTeacher = decoded?.role === Role.Teacher;

    const isAllowedStudent =
        decoded?.role === Role.Student &&
        decoded.id === allowedStudentID;

    if (isAllowedTeacher || isAllowedStudent) {
        return next();
    }

    return res.status(503).json({
        status: "maintenance",
        message: "The platform is temporarily unavailable for maintenance. Please try again later.",
    });
};