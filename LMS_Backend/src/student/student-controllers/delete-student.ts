import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Student } from "../student-model";
import mongoose from "mongoose";





export const deleteStudent: RequestHandler<{id:string}> = (req, res,next) => {
    try{
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }
        const student = Student.findByIdAndDelete(id).exec();
        if(!student){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Student deleted successfully",
            data: student
        });
    }catch(err){
        next(err);
    }
}