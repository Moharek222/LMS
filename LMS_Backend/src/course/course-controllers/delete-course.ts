import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Course } from "../course-model";
import { Lesson } from "../../lesson/lesson-model";





export const deleteCourse:RequestHandler<{courseID:string}> = async (req,res,next) =>{
    try{
        const { courseID } = req.params;
        if(!mongoose.Types.ObjectId.isValid(courseID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid course ID format"
            });
        }
        const lessons = await Lesson.find({courseID}).lean().exec();
        if(lessons.length > 0){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Cannot delete course with active lessons"
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