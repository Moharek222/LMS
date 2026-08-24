import { RequestHandler } from "express";
import { Role, User } from "../user-model";
import {body} from "express-validator";
import mongoose from "mongoose";
export const updateUserValidator=[
    body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
    body("role")
    .optional()
    .isIn(Object.values(Role))
    .withMessage("Invalid role"),
]
interface IRequest{
    isActive?:boolean
    role?:Role
}

interface IResponse{
    message:string
    data?:any
}

export const updateUser:RequestHandler<{id:string},IResponse,IRequest>=async (req,res)=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }
        const { isActive , role }=req.body;
        const updatedByID = req.user?.id;
        const updateData:any={};
        if(updatedByID){
            updateData.updatedByID=updatedByID;
        }
        if(isActive!==undefined){
            updateData.isActive=isActive;
        }
        if(role!==undefined){
            updateData.role=role;
        }
        const user=await User.findByIdAndUpdate(
            req.params.id,
            {$set:updateData},
            {new:true,runValidators:true})
            .exec();
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json({message:"User updated successfully",data:user});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"Internal server error"});
    }
}