import { RequestHandler } from "express";
import { Student } from "../student/student-model";
import { Role } from "../user/user-model";

export const logout: RequestHandler = async (req, res,next) => {
    try{
        const stRole=req.user?.role
        const stId=req.user?.id
        if(stRole===Role.Student){
            await Student.findByIdAndUpdate(
                stId,
                {
                    $set:{activeToken:null}
                }
            ).exec()
        }
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        return res.status(200).json({
            message: "Logged out successfully"
        });
    }catch(err){
        next(err);
    }
};