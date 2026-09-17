import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Student } from "../student-model";
import mongoose from "mongoose";


export const activeStudent:RequestHandler<{id: string}> =async (req,res ,next) =>{
    try{
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }
        const student = await Student.findByIdAndUpdate(
            id,
            {$set:{isActive: true}},
            {new: true, runValidators: true});
        if(!student){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Student activated successfully",
            data: student
        });
    }catch(err){
        next(err);
    }
}