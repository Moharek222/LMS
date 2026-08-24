import { RequestHandler } from "express";
import { Role, User } from "../user-model";
import bcrypt from "bcrypt";
import {body} from "express-validator";

export const validator = [
    body("name")
    .trim()
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("email")
    .trim()
    .isEmail().withMessage("Invalid email address"),
    body("password")
    .trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role")
    .optional()
    .isIn(Object.values(Role)).withMessage("Invalid role")
]

interface IRequest {
    name: string;
    email: string;
    password: string;
    role?: Role
}

interface IResponse {
    message: string;
    data?: any;
}


export const addUser: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {
    try {
        const { name, email, password, role = Role.Student } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        return res.status(201).json({
            message: "User created successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if ((error as any).code === 11000) {
            return res.status(409).json({
                message: "User already exists"
            });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};