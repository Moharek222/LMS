import mongoose from "mongoose";

interface IQuestion extends mongoose.Document {
    type: "MCQ" | "ESSAY";
    points: number;
    question: string;
    questionImage?: string;
    options?: string[];
    answer?: string;
}

export interface IExam extends mongoose.Document {
    courseID: mongoose.Types.ObjectId;
    title: string;
    duration: number;
    questions: IQuestion[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const questionSchema = new mongoose.Schema<IQuestion>({
    type: {
        type: String,
        enum: ["MCQ", "ESSAY"],
        required: true,
        default: "MCQ"
    },
    points: {
        type: Number,
        required: true,
        min: [1, "Question points must be at least 1"]
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    questionImage: {
        type: String,
        trim: true,
        default: null
    },
    options: {
        type: [String],
        required: function (this: any) { 
            return this.type === "MCQ"; 
        },
        validate: {
            validator: function (this: any, arr: string[]) {
                if (this.type === "ESSAY") return true;
                return arr && arr.length >= 2;
            },
            message: "MCQ questions require at least two options"
        }
    },
    answer: {
        type: String,
        required: function (this: any) { 
            return this.type === "MCQ"; 
        },
        trim: true,
        validate: {
            validator: function (this: any, val: string) {
                if (this.type === "ESSAY") return true;
                return this.options ? this.options.includes(val) : false;
            },
            message: "The answer must be exactly one of the provided options"
        }
    }
});

const examSchema = new mongoose.Schema<IExam>({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: [0, "Duration can not be negative"]
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: function (arr: IQuestion[]) {
                return arr.length >= 1;
            },
            message: "At least one question is required"
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Exam = mongoose.model<IExam>("Exam", examSchema);