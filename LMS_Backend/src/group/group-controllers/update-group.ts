import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose, { Error } from "mongoose";
import { Group } from "../group-model";




export const updateGroupValidation = [
    body("name")
        .optional()
        .isString().withMessage("Name must be a string")
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),
]

interface IRequest {
    name?: string,
    isActive?: boolean
}
interface IResponse {
    message: string,
    data?: any
}

export const updateGroup: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try{
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID"
            });
        }
        const { name, isActive } = req.body;
        const updateData: any = {};
        if (name) {
            updateData.name = req.body.name;
        }
        if (isActive) {
            updateData.isActive = req.body.isActive;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }
        
        const group = await Group.findOneAndUpdate(
            { _id: id },
            {$set:updateData},
            { returnDocument: 'after', runValidators: true });
        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Group not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Group updated successfully",
            data: group
        });
    }catch(err:any){
        if (err.code === 11000) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Group name already exists"
            });
            return;
        }
        console.log("Update Group Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}