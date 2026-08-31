import mongoose from "mongoose";


interface ISelectedOption {
    QuestionId: mongoose.Types.ObjectId;
    selectedAnswer: string
}

export interface IQuizSubmission extends mongoose.Document {
    studentID: mongoose.Types.ObjectId;
    quizID: mongoose.Types.ObjectId;
    selectedOption: ISelectedOption[];
    score: number;
    isPassed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const quizSubmissionSchema = new mongoose.Schema<IQuizSubmission>({
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    quizID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    selectedOption: {
        type: [
            {
                QuestionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true
                },
                selectedAnswer: {
                    type: String,
                    required: true
                }
            }
        ],
        required: true,
        validate: {
            validator: function (selectedOption: ISelectedOption[]) {
                return selectedOption.length > 0;
            },
            message: "At least one question is required"
        }
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

quizSubmissionSchema.index({ studentID: 1, quizID: 1 }, { unique: true });

export const QuizSubmission = mongoose.model<IQuizSubmission>("QuizSubmission", quizSubmissionSchema);