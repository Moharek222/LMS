import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { User ,Role } from "../user-model";
import { StatusCodes } from "http-status-codes";

export const addAdmin: RequestHandler = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: Role.Admin, 
            isActive: true
        });

        return res.status(StatusCodes.CREATED).json({ 
            message: "admin account created successfully",
            admin
        });
    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};