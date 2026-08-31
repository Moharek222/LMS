import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./src/auth/auth-router";
import groupRouter from "./src/group/group-router";
import accessCodeRouter from "./src/access-code/access-code-router";
import userRouter from "./src/user/user-router";
import courseRouter from "./src/course/course-router";
import lessonRouter from "./src/lesson/lesson-router";
import quizRouter from "./src/quiz/quiz-router";
import studentRouter from "./src/student/student-router";
import quizSubmissionRouter from "./src/quiz-submission/quiz-submission-router";
import examRouter from "./src/exam/exam-router";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const URI = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
mongoose
    .connect(`${URI}/${DB_NAME}`)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);

        process.exit(1);
    });

// mongoose.connection.on("connected", () => {
//     console.log("Connected to database:", mongoose.connection.name);
//     console.log("Host:", mongoose.connection.host);
// });
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

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/exams", examRouter);
app.use("/api/students", studentRouter);
app.use("/api/access-codes", accessCodeRouter);
app.use("/api/groups", groupRouter);
app.use("/api/courses", courseRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/quiz-submissions", quizSubmissionRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err);

    res.status(500).json({
        message: err.message || "Internal Server Error",
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
