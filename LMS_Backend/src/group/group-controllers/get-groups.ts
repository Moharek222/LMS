import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Group } from "../group-model";


interface IQuery {
    page?: string;
    limit?: string;
}

export const getGroups: RequestHandler<{}, {}, {}, IQuery> = async (req, res) => {
    try {
        const filter: any = {
            isActive: true
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const groups = await Group.find(filter)
            .sort({ level: 1, name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();

        const total = await Group.countDocuments(filter);
        res.status(StatusCodes.OK).json({
            message: "Groups fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: groups
        });
    } catch (err) {
        console.log("Get Groups Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};