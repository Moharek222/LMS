import { RequestHandler } from "express";
import { Student } from "../student/student-model";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";

export const registerValidation = [
        body("name")
                .trim()
                .notEmpty().withMessage("Name is required")
                .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
        body("password")
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 4 }).withMessage("Password must be at least 4 characters long"),
        body("phone")
                .trim()
                .notEmpty().withMessage("Phone number is required")
                .isLength({ min: 11, max: 11 }).withMessage("Phone number must be 11 digits long"), // اتعدلت لـ 11
        body("groupId") 
                .notEmpty().withMessage("Group ID is required")
                .isMongoId().withMessage("Invalid Group ID format")
];

interface IRegisterBody {
        name: string;
        password: string;
        phone: string;
        groupId: string;
}

export const registerHandler: RequestHandler<{}, {}, IRegisterBody> = async (req, res, next) => {
        try {
                const { name, password, phone, groupId } = req.body;

                const student = await Student.findOne({ phone }).exec();
                if (student) return res.status(StatusCodes.CONFLICT).json({ message: "Phone number is already registered" });

                const hashed = await bcrypt.hash(password, 10);
                
                const newStudent = new Student({ phone, password: hashed, name, groupId });
                await newStudent.save();
                
                const studentObj = newStudent.toObject();
                const { password: _, ...studentWithoutPassword } = studentObj;

                return res.status(StatusCodes.CREATED).json({
                        message: "Register successful. You can now login.",
                        student: studentWithoutPassword
                });
        } catch (err) {
                next(err);
        }
};