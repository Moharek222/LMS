import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Attendance } from "../attendance-model";

export const getGroupAttendance: RequestHandler<{ groupID: string }> = async (req, res, next) => {
    try {
        const { groupID } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid group ID format" });
        }
        const page=Math.max(1,Number(req.query.page) || 1);
        const limit=Math.max(1,Number(req.query.limit) || 10);

        const attendance = await Attendance.find({ groupID })
            .sort({ date: -1 })
            .skip((page-1)*limit)
            .limit(limit)
            .lean()
            .exec();

        const total = await Attendance.countDocuments({ groupID });

        res.status(StatusCodes.OK).json({
            message: "Attendance fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: attendance
        });
    } catch (err) {
        next(err);
    }
};