import mongoose from "mongoose";

export interface IStudentAnswer{
    questionID: mongoose.Types.ObjectId;
    type: "MCQ" | "ESSAY"; 
    studentAnswer: string;  
    score: number;
    isCorrect?: boolean;
    teacherFeedback?: string;
}

export interface IExamSubmission extends mongoose.Document {
    examID: mongoose.Types.ObjectId;
    studentID: mongoose.Types.ObjectId;
    answers: IStudentAnswer[];
    mcqScore: number;
    essayScore: number;
    totalScore: number;
    totalExamPoints: number
    status: "PENDING" | "GRADED"; 
    gradedBy?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const studentAnswerSchema = new mongoose.Schema<IStudentAnswer>({
    questionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: ["MCQ", "ESSAY"],
        required: true
    },
    studentAnswer: {
        type: String,
        required: true,
        trim: true
    },
    score: {
        type: Number,
        default: 0
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    teacherFeedback: {
        type: String,
        trim: true,
        default: null
    }
}, { _id: false });

const examSubmissionSchema = new mongoose.Schema<IExamSubmission>({
    examID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    answers: {
        type: [studentAnswerSchema],
        required: true
    },
    mcqScore: {
        type: Number,
        required: true,
        default: 0
    },
    essayScore: {
        type: Number,
        required: true,
        default: 0
    },
    totalScore: {
        type: Number,
        required: true,
        default: 0
    },
    totalExamPoints: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "GRADED"],
        required: true,
        default: "PENDING" 
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

examSubmissionSchema.index({ examID: 1, studentID: 1 }, { unique: true });

export const ExamSubmission = mongoose.model<IExamSubmission>("ExamSubmission", examSubmissionSchema);