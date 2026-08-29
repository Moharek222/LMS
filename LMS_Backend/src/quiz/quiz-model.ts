import mongoose from "mongoose";


interface IQuestion {
    question: string;
    options: string[];
    answer: string;
}


interface IQuiz extends mongoose.Document {
    lessonID: mongoose.Types.ObjectId;
    title: string;
    questions: IQuestion[];
    duration: number;
    isActive: boolean;
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
            validator: function (arr: string[]) {
                return arr.length >= 2;
            },
            message: "At least two options are required"
        }
    },
    answer: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (this: any, val: string) {
                return this.options.includes(val);
            },
            message: "The answer must be exactly one of the provided options"
        }
    }
});


const quizSchema = new mongoose.Schema<IQuiz>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    lessonID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
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
    duration: {
        type: Number,
        required: true,
        min: [0, "Duration can not be negative"]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);