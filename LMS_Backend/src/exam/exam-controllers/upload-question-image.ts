import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const uploadQuestionImage: RequestHandler = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "No image provided" });
        }

        res.status(StatusCodes.OK).json({
            message: "Image uploaded successfully",
            data: {
                imageUrl: (req.file as any).secure_url || req.file.path
            }
        });
    } catch (err) {
        next(err);
    }
};;