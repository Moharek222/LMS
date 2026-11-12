import { RequestHandler } from "express";
import { Student } from "../student/student-model";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { Grade } from "../interfaces/grade";
import { Group } from "../group/group-model";
import { AcademicTrack } from "../interfaces/academic-track";

export const registerValidation = [
        body("name")
                .trim()
                .notEmpty().withMessage("Name is required")
                .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
        body("password")
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 4 }).withMessage("Password must be at least 4 characters long"),
        body("phone")
                .trim()
                .notEmpty().withMessage("Phone number is required")
                .isLength({ min: 11, max: 11 }).withMessage("Phone number must be 11 digits long"),
        body("parentPhone")
                .optional({ checkFalsy: true })
                .trim()
                .isLength({ min: 11, max: 11 }).withMessage("Parent phone number must be 11 digits long"),
        body("grade")
                .notEmpty().withMessage("Grade is required")
                .bail()
                .isIn(Object.values(Grade)).withMessage("Invalid grade"),

        body("groupID")
                .if((_, { req }) => req.body.grade !== Grade.SecondSecondary)
                .notEmpty().withMessage("Group ID is required")
                .bail()
                .isMongoId().withMessage("Invalid Group ID format"),
        body("groupID")
                .if((value, { req }) => req.body.grade === Grade.SecondSecondary)
                .custom((value) => value === undefined || value === null || value === "")
                .withMessage("Second secondary students must not be assigned to a group"),

        body("academicTrack")
                .if((_, { req }) => req.body.grade === Grade.SecondSecondary)
                .notEmpty().withMessage("Please select academic track")
                .bail()
                .isIn(Object.values(AcademicTrack)).withMessage("Invalid academic track"),
        body("academicTrack")
                .if((value, { req }) => req.body.grade !== Grade.SecondSecondary)
                .custom((value) => value === undefined || value === null || value === "")
                .withMessage("Academic track is only applicable to second secondary students"),
];

interface IRegisterBody {
        name: string;
        password: string;
        grade: Grade;
        phone: string;
        groupID?: string;
        parentPhone?: string;
        academicTrack?: AcademicTrack;
}

export const registerHandler: RequestHandler<{}, {}, IRegisterBody> = async (req, res, next) => {
        try {
                const {
                        name,
                        password,
                        phone,
                        parentPhone,
                        groupID,
                        grade,
                        academicTrack
                } = req.body;

                const isSecondSecondary = grade === Grade.SecondSecondary;

                const student = await Student.findOne({ phone }).exec();
                if (student) {
                        return res.status(StatusCodes.CONFLICT).json({
                                message: "Phone number is already registered"
                        });
                }

                let validatedGroupID: string | undefined;

                if (isSecondSecondary) {
                        if (!academicTrack || !Object.values(AcademicTrack).includes(academicTrack)) {
                                return res.status(StatusCodes.BAD_REQUEST).json({
                                        message: "Please provide a valid academic track for second secondary students"
                                });
                        }

                        if (groupID) {
                                return res.status(StatusCodes.BAD_REQUEST).json({
                                        message: "Second secondary students cannot be assigned to a group"
                                });
                        }
                } else {
                        if (academicTrack) {
                                return res.status(StatusCodes.BAD_REQUEST).json({
                                        message: "Academic track is only applicable to second secondary students"
                                });
                        }

                        if (!groupID) {
                                return res.status(StatusCodes.BAD_REQUEST).json({
                                        message: "Group ID is required"
                                });
                        }

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

                        validatedGroupID = groupID;
                }

                const hashed = await bcrypt.hash(password, 10);

                const newStudent = new Student({
                        phone,
                        parentPhone: parentPhone || null,
                        grade,
                        ...(isSecondSecondary ? { academicTrack } : {}),
                        password: hashed,
                        name,
                        ...(validatedGroupID ? { groupID: validatedGroupID } : {})
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
