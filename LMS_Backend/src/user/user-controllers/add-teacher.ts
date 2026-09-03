import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { User ,Role } from "../user-model";
import { StatusCodes } from "http-status-codes";

interface IRequest {
    name: string;
    email: string;
    password: string;
}
interface IResponse {
    message: string;
    teacher?: unknown;
}
export const addTeacher: RequestHandler<{}, IResponse, IRequest, {}> = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await User.create({
            name,
            email,
            password: hashedPassword,
            role: Role.Teacher, 
            isActive: true
        });

        return res.status(StatusCodes.CREATED).json({ 
            message: "Teacher account created successfully",
            teacher
        });
    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};