import mongoose from "mongoose";

export interface IQuizSubmission extends mongoose.Document {
    studentId: mongoose.Schema.Types.ObjectId;
    quizId: mongoose.Schema.Types.ObjectId;
    score: number;
    isPassed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const quizSubmissionSchema = new mongoose.Schema<IQuizSubmission>({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: [0, "Score can not be negative"]
    },
    isPassed: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

quizSubmissionSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

export const QuizSubmission = mongoose.model<IQuizSubmission>("QuizSubmission", quizSubmissionSchema);