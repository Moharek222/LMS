import { RequestHandler } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Role, User } from "../user-model";


export const getAdmins: RequestHandler = async (req, res,next) => {
    try {
        const page=Math.max(1,Number(req.query.page) || 1);
        const limit=Math.max(1,Number(req.query.limit) || 10);
        const admins = await User.find({ role: Role.Admin })
        .sort({ createdAt: -1 })
        .skip((page-1)*limit)
        .limit(limit)
        .lean()
        .exec();
        const total = await User.countDocuments({ role: Role.Admin });
        res.status(StatusCodes.OK).json({
            message: "Admins fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit),
            data: admins
        });
    }catch(err){
        next(err);
    }
}