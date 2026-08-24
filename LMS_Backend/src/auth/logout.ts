import { RequestHandler } from "express";

export const logout: RequestHandler = (req, res) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        return res.status(200).json({
            message: "Logged out successfully"
        });
};