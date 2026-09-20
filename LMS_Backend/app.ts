import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Routers
import authRouter from "./src/auth/auth-router";
import groupRouter from "./src/group/group-router";
import accessCodeRouter from "./src/access-code/access-code-router";
import userRouter from "./src/user/user-router";
import courseRouter from "./src/course/course-router";
import lessonRouter from "./src/lesson/lesson-router";
import studentRouter from "./src/student/student-router";
import progressRouter from "./src/progress/progress-router";

dotenv.config();
const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;
const URI = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

if (!URI || !DB_NAME) {
    console.error("FATAL ERROR: DB_URL or DB_NAME is not defined in .env");
    process.exit(1);
}

mongoose
    .connect(URI, {
        dbName: DB_NAME
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

app.use(helmet());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use("/api", globalLimiter);

const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL.replace(/\/$/, ""), "http://localhost:5173", "http://localhost:3000"]
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Skip-Auth-Redirect", "x-skip-auth-redirect"]
    })
);

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/access-codes", accessCodeRouter);
app.use("/api/groups", groupRouter);
app.use("/api/students", studentRouter);
app.use("/api/courses", courseRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/progress", progressRouter);
app.get('/', (req, res) => {
    res.status(200).send('LMS API is running');
})

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err);

    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === "production" 
            ? "Internal Server Error" 
            : err.message,
    });
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});


process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(async () => {
        console.log("HTTP server closed.");
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    });
});