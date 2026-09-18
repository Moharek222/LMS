import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { UserToken } from "../interfaces/user-token";

export const isAuthenticated: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];

    try {
        req.user = <UserToken>jwt.verify(token, process.env.secretKey!);
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized, please login" });
    }
};