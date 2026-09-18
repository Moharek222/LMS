import { RequestHandler } from "express";
import { Student } from "../student/student-model";
import jwtService from "../services/jwt-service";
import { Role } from "../user/user-model";

export const refreshSession: RequestHandler = async (req, res, next) => {
    try {
        const { refreshToken } = req.body; 
        
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is missing, please login again" });
        }
        
        const decoded = jwtService.verifyToken(refreshToken) as any; 
        const student = await Student.findById(decoded.id);
        
        if (!student || !student.isActive) {
            return res.status(403).json({ message: "Account deactivated or not found" });
        }

        if (student.activeToken !== decoded.sessionId) {
            return res.status(401).json({ message: "Session expired or invalid, please login again" });
        }
        
        const newToken = jwtService.createToken(
            { id: student._id, phone: student.phone, role: Role.Student, sessionId: decoded.sessionId },
            { expiresIn: "2h" }
        );
        return res.status(200).json({
            message: "Token refreshed successfully",
            token: newToken
        });

    } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token, please login again" });
    }
};