import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AccessCode } from "../access-code-model";



export const getAllAccessCode:RequestHandler = async (req, res) => {
    try {
        const page=Math.max(1,Number(req.query.page) || 1);
        const limit=Math.max(1,Number(req.query.limit) || 10);
        const accessCode = await AccessCode.find({})
        .populate("studentID","name phone")
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(limit)
        .lean()
        .exec();
        const total = await AccessCode.countDocuments({});
        res.status(StatusCodes.OK).json({
            message:"Access Code fetched successfully",
            page,
            limit,
            total,
            totalPages:Math.ceil(total/limit),
            data:accessCode
        });
    } catch (error) {
        console.log("Get All Access Code Error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}