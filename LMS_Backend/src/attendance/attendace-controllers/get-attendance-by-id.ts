import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Attendance } from "../attendance-model";
import { Student } from "../../student/student-model";

export const getAttendanceById: RequestHandler<{ attendanceID: string }> = async (req, res, next) => {
    try {
        const { attendanceID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(attendanceID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: "Invalid attendance ID format" 
            });
        }
        const attendance = await Attendance.findById(attendanceID).lean().exec();

        if (!attendance) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Attendance record not found"
            });
        }
        const groupStudents = await Student.find({ 
            groupID: attendance.groupID,
            isActive: true 
        })
        .select("name phone")
        .lean()
        .exec();

        const presentStudentIds = attendance.presentStudents.map(id => id.toString());
        const formattedStudents = groupStudents.map(student => {
            const isPresent = presentStudentIds.includes(student._id.toString());
            
            return {
                _id: student._id,
                name: student.name,
                phone: student.phone,
                status: isPresent ? "Present" : "Absent"
            };
        });
        const totalPresent = presentStudentIds.length;
        const totalAbsent = formattedStudents.length - totalPresent;

        res.status(StatusCodes.OK).json({
            message: "Attendance details fetched successfully",
            date: attendance.date,
            stats: {
                totalStudents: formattedStudents.length,
                totalPresent,
                totalAbsent
            },
            data: formattedStudents
        });
    } catch (err) {
        next(err);
    }
};

// import { RequestHandler } from "express";
// import mongoose from "mongoose";
// import { StatusCodes } from "http-status-codes";
// import { Attendance } from "../attendance-model";

// export const getAttendanceById: RequestHandler<{ attendanceID: string }> = async (req, res, next) => {
//     try {
//         const { attendanceID } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(attendanceID)) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ 
//                 message: "Invalid attendance ID format" 
//             });
//         }

//         const attendance = await Attendance.findById(attendanceID)
//             .populate("presentStudents", "name phone")
//             .lean()
//             .exec();

//         if (!attendance) {
//             return res.status(StatusCodes.NOT_FOUND).json({
//                 message: "Attendance record not found"
//             });
//         }

//         res.status(StatusCodes.OK).json({
//             message: "Attendance details fetched successfully",
//             totalPresent: attendance.presentStudents.length,
//             data: attendance
//         });
//     } catch (err) {
//         next(err);
//     }
// };