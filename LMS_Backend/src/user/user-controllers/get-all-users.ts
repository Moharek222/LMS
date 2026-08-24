import { RequestHandler } from "express";
import { User } from "../user-model";


export const getAllUsers: RequestHandler = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1);
        const limit =Math.max(Number(req.query.limit) || 10);
        const filterobj:any={};
        if(req.query.role){
            filterobj.role=req.query.role;
        }
        if(req.query.isActive){
            filterobj.isActive=req.query.isActive;
        }

        const [ users, total] = await Promise.all([
            User.find({ filterobj })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            User.countDocuments({ filterobj })
        ]);;

        return res.status(200).json({
            message: "Users fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};