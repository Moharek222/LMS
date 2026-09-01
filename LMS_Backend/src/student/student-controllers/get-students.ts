import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Student } from "../student-model";



export const getStudents:RequestHandler = async (req,res,next) => {
    try{
        const page = Math.max(1,Number(req.query.page) || 1);
        const limit = Math.max(1,Number(req.query.limit) || 10);
        const students = await Student.find({isActive:true})
        .sort({createdAt:-1})
        .populate("groupID","name")
        .skip((page-1)*limit)
        .limit(limit)
        .lean()
        .exec();
        const total = await Student.countDocuments({isActive:true});
        res.status(StatusCodes.OK).json({
            message: "Students fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit),
            data: students
        });
    }catch(err){
        next(err);
    }
};