import { RequestHandler } from "express";
import mongoose from "mongoose";
import { User } from "../user-model";

export const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }
        const user = await User.findById(req.params.id).lean().exec();
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "User fetched successfully",
            data: user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}