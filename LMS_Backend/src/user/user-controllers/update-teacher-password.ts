import { RequestHandler } from "express";
import bcrypt from "bcrypt"
import { Role, User } from "../user-model";

interface IRequest{
    newPassword:string
}
interface IResponse{
    message:string
    data?:any
}


export const updateTeacherPassword:RequestHandler<{},IResponse,IRequest>= async (req, res, next) => {
    try{
        const {newPassword} = req.body
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedTeacher = await User.findOneAndUpdate
        ({role:Role.Teacher},
            {password:hashedPassword},
            {returnDocument:"after"});

        return res.status(200).json({message:"Password updated successfully", data:updatedTeacher});
    }catch(err){
        next(err);
    }
}