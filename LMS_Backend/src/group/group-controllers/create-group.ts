import { RequestHandler } from "express";
import { Group } from "../group-model";

import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";


export const addGroupValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
]


interface IRequest {
    name: string;
    // level: string;
}

interface IResponse {
    message: string;
    data?: any;
}

export const createGroup: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {
    try {
        const { name } = req.body;
        const group = await Group.create({ name });
        res.status(StatusCodes.CREATED).json({
            message: "Group created successfully",
            data: group
        });
    } catch (err: any) {
        if (err.code === 11000) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Group name already exists"
            });
            return;
        }

        console.log("Create Group Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};