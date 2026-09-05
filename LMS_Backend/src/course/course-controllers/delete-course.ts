import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Course } from "../course-model";





export const deleteCourse:RequestHandler<{courseID:string}> = async (req,res,next) =>{
    try{
        const { courseID } = req.params;
        if(!mongoose.Types.ObjectId.isValid(courseID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }
        const course = await Course.findByIdAndUpdate(
            courseID,
            {$set:{isActive:false}})
            .lean()
            .exec();
        if(!course){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Course not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Course deleted successfully",
            data: course
        });
    }catch(err){
        next(err);
    }
}