import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Student } from "../student-model";




export const deleteStudent:RequestHandler<{ id: string }> = async (req, res ,next) => {
    try{
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }

        const student = await Student.findByIdAndUpdate(
            id, 
            { $set: { isActive: false } },
            { new: true, runValidators: true });

        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Student deleted successfully",
            data: student
        })
        
    }catch(err){
        console.log("Delete Student Error:", err);
        next(err);
    }
}