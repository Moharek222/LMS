import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Attendance } from "../attendance-model";

export const getStudentAttendancePercentage: RequestHandler<{ groupID: string, studentID?: string }> = async (req, res, next) => {
    try {
        const { groupID, studentID: paramStudentID } = req.params;
        const targetStudentID = paramStudentID || req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid group ID format" });
        }

        if (!targetStudentID || !mongoose.Types.ObjectId.isValid(targetStudentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid student ID format" });
        }

        const result = await Attendance.aggregate([
            {
                $match: {
                    groupID: new mongoose.Types.ObjectId(groupID)
                }
            },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    attendedSessions: {
                        $sum: {
                            $cond: [
                                { $in: [new mongoose.Types.ObjectId(targetStudentID), "$presentStudents"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSessions: 1,
                    attendedSessions: 1,
                    attendancePercentage: {
                        $cond: [
                            { $eq: ["$totalSessions", 0] },
                            0,
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ["$attendedSessions", "$totalSessions"] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            }
                        ]
                    }
                }
            }
        ]);

        const stats = result.length > 0 ? result[0] : {
            totalSessions: 0,
            attendedSessions: 0,
            attendancePercentage: 0
        };

        res.status(StatusCodes.OK).json({
            message: "Attendance percentage calculated successfully",
            data: stats
        });

    } catch (err) {
        next(err);
    }
};