import mongoose from "mongoose";

export interface IExamSubmission extends mongoose.Document {
    studentId: mongoose.Schema.Types.ObjectId;
    examId: mongoose.Schema.Types.ObjectId;
    score: number;
    isPassed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const examSubmissionSchema = new mongoose.Schema<IExamSubmission>({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
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

examSubmissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export const ExamSubmission = mongoose.model<IExamSubmission>("ExamSubmission", examSubmissionSchema);