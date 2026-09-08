import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ExamSubmission } from "../exam-submission-model";


export const deleteSubmission: RequestHandler<{submissionID:string}> = async (req, res , next) => {
    try{
        const { submissionID } = req.params;
        if(!mongoose.Types.ObjectId.isValid(submissionID)){
            return res.status(StatusCodes.BAD_REQUEST)
            .json({message:"Invalid submission ID format"});
        }
        const submission = await ExamSubmission.findByIdAndDelete(submissionID);
        if(!submission){
            return res.status(StatusCodes.NOT_FOUND).json({message:"Submission not found"});
        }
        res.status(StatusCodes.OK)
        .json({message:"Submission deleted successfully"});
    }catch(err){
        next(err);
    }
}