import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Course } from "../course-model";


export const getCourses:RequestHandler = async (req,res,next) => {
    try{
        const page = Math.max(1,Number(req.query.page) || 1);
        const limit = Math.max(1,Number(req.query.limit) || 10);
        const courses = await Course.find({isActive:true})
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(limit)
        .lean()
        .exec();
        const total = await Course.countDocuments({isActive:true});
        res.status(StatusCodes.OK).json({
            message: "Courses fetched successfully",
            page,
            limit,
            total,            
            totalPages: Math.ceil(total/limit),
            data: courses
        });
    }catch(err){
        next(err);
    }
}