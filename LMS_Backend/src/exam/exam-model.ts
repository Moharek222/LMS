import mongoose from "mongoose";

interface IQuestion{
    question: string;
    options: string[];
    answer: string;
}


export interface IExam extends mongoose.Document{
    courseID: mongoose.Schema.Types.ObjectId;
    title: string;
    duration: number;
    questions: IQuestion[];
    createdAt?: Date;
    updatedAt?: Date;
}

const questionSchema = new mongoose.Schema<IQuestion>({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function(arr: string[]) {
                return arr.length >= 2;
            },
            message: "At least two options are required"
        }
    },
    answer: {
        type: String,
        required: true,
        trim: true
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
            validator: function(arr: IQuestion[]) {
                return arr.length >= 1;
            },
            message: "At least one question is required"
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Exam = mongoose.model<IExam>("Exam", examSchema);