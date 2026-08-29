import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AccessCode } from "../access-code-model";
import mongoose from "mongoose";




export const getAccessCodes:RequestHandler<{ id: string }> = async (req, res, next) => {
    try{
        const studentID = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(studentID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }
        const page=Math.max(1,Number(req.query.page) || 1);
        const limit=Math.max(1,Number(req.query.limit) || 10);
        const accessCodes = await AccessCode.find({ studentID })
        .sort({ createdAt: -1 })
        .populate("studentID", "name phone")
        .skip((page-1)*limit)
        .limit(limit)
        .lean()
        .exec();
        const total = await AccessCode.countDocuments({ studentID });
        res.status(StatusCodes.OK).json({
            message: "Access codes fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: accessCodes
        })
    }catch(err){
        next(err);
    }
}