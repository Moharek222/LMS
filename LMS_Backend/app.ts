import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
//routers
import authRouter from "./src/auth/auth-router";
import groupRouter from "./src/group/group-router";
import accessCodeRouter from "./src/access-code/access-code-router";
import userRouter from "./src/user/user-router";
import courseRouter from "./src/course/course-router";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const URI = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
// MongoDB Connection with caching for serverless environments
let isConnected = false;
const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        isConnected = true;
        return;
    }

    if (!URI) {
        throw new Error("DB_URL is not defined");
    }

    try {
        const dbUri =
            DB_NAME && !URI.includes(DB_NAME)
                ? `${URI}/${DB_NAME}`
                : URI;

        await mongoose.connect(dbUri);

        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
};

connectDB();

// Middleware to ensure DB is connected for incoming requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// const allowedOrigins = process.env.FRONTEND_URL
//     ? [process.env.FRONTEND_URL, "http://localhost:5173"]
//     : (origin: any, callback: any) => callback(null, true);

// app.use(
//     cors({
//         origin: allowedOrigins,
//         credentials: true,
//     })
// );

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

// Routes

app.use("/api/auth", authRouter);
app.use("/api/groups", groupRouter);
app.use("/api/access-codes", accessCodeRouter);
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err);

    res.status(500).json({
        message: err.message || "Internal Server Error",
    });
});

if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
}
export default app;