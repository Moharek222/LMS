import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { User } from "../user-model";



export const deleteAdmin: RequestHandler<{ id: string }> = async (req, res,next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid admin ID format"
            });
        }

        const admin = await User.findByIdAndDelete(id);
        if (!admin) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Admin not found"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Admin deleted successfully",
            data: admin
        });
    }catch(err){
        next(err);
    }
}