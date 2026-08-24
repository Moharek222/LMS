// import { RequestHandler } from "express";
// import { StatusCodes } from "http-status-codes";
// import { Enrollment } from "../enrollment/enrollment-model";

// declare global {
//     namespace Express {
//         interface Request {
//             isEnrolled?: boolean;
//         }
//     }
// }

// export const checkEnrollment: RequestHandler<{ id: string }> = async (req, res, next) => {
//     try {
//         const studentID = req.user?.id;
//         const courseID = req.params.id;
//         if (!studentID || !courseID) {
//             req.isEnrolled = false;
//             return next();
//         }
//         const enrollment = await Enrollment.findOne({ courseID, studentID }).lean().exec()
//         req.isEnrolled = !!enrollment;
//         next();
//     } catch (err) {
//         console.error(err);
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
//     }
// }