import { RequestHandler } from "express";

export const checkServiceStatus:RequestHandler = (req, res, next) => {
    const isSuspended = process.env.SERVICE_SUSPENDED === 'true';
    // const myIp = process.env.MY_DEV_IP

    if (isSuspended) {
        return res.status(503).json({
            status: 'error',
            message: "pay Rrender subscription to access this service",
        });
    }

    next();
};