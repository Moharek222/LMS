import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AccessCode, Status } from "../access-code/access-code-model";

export const requireActiveSubscription: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                message: "Unauthorized, please login first" 
            });
        }

        const activeCode = await AccessCode.findOne({
            studentId: userId,
            status: Status.Active
        });

        if (!activeCode) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "You do not have an active subscription. Please purchase an access code."
            });
        }

        if (activeCode.expiresAt <= new Date()) {
            activeCode.status = Status.Expired;
            await activeCode.save();
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "Your subscription has expired. Please renew to access this content."
            });
        }
        next();
    } catch (error) {
        console.error("Subscription Verification Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error while verifying subscription"
        });
    }
};