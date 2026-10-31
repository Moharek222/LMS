import { RequestHandler } from "express";
import { Student } from "../student/student-model";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { Grade } from "../interfaces/grade";
import { Group } from "../group/group-model";

export const registerValidation = [
        body("name")
                .trim()
                .notEmpty().withMessage("Name is required")
                .isLength({ min: 3 }).withMessage("Name must be at least 2 characters long"),
        body("password")
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 4 }).withMessage("Password must be at least 4 characters long"),
        body("phone")
                .trim()
                .notEmpty().withMessage("Phone number is required")
                .isLength({ min: 11, max: 11 }).withMessage("Phone number must be 11 digits long"), // اتعدلت لـ 11
        body("groupID")
                .notEmpty().withMessage("Group ID is required")
                .isMongoId().withMessage("Invalid Group ID format"),
        body("parentPhone")
                .optional({ checkFalsy: true })
                .trim()
                .isLength({ min: 11, max: 11 }).withMessage("Parent phone number must be 11 digits long"),

        body("grade")
                .notEmpty()
                .withMessage("Grade is required")
                .isIn(Object.values(Grade))
                .withMessage("Invalid grade"),
];

interface IRegisterBody {
        name: string;
        password: string;
        grade: Grade;
        phone: string;
        groupID: string;
        parentPhone?: string;
}

export const registerHandler: RequestHandler<{}, {}, IRegisterBody> = async (req, res, next) => {
        try {
                const { name, password, phone, parentPhone, groupID, grade } = req.body;

                const student = await Student.findOne({ phone }).exec();
                if (student) return res.status(StatusCodes.CONFLICT).json({
                        message: "Phone number is already registered"
                });

                const group = await Group.findById(groupID)
                        .select("grade isActive")
                        .lean()
                        .exec();

                if (!group) {
                        return res.status(StatusCodes.NOT_FOUND).json({
                                message: "Group not found"
                        });
                }

                if (!group.isActive) {
                        return res.status(StatusCodes.BAD_REQUEST).json({
                                message: "Cannot register in an inactive group"
                        });
                }

                if (!group.grade) {
                        return res.status(StatusCodes.CONFLICT).json({
                                message: "Group grade has not been configured yet"
                        });
                }

                if (group.grade !== grade) {
                        return res.status(StatusCodes.BAD_REQUEST).json({
                                message: "Selected grade does not match the selected group"
                        });
                }

                const hashed = await bcrypt.hash(password, 10);

                const newStudent = new Student({
                        phone,
                        parentPhone: parentPhone ? parentPhone : null,
                        grade: grade,
                        password: hashed,
                        name,
                        groupID
                });
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