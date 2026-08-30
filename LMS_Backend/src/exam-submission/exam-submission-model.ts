import mongoose from "mongoose";


interface ISelectedOption {
    QuestionId: mongoose.Types.ObjectId;
    selectedAnswer: string
}

export interface IExamSubmission extends mongoose.Document {
    studentID: mongoose.Types.ObjectId;
    examID: mongoose.Types.ObjectId;
    score: number;
    selectedOption: ISelectedOption[];
    isPassed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const examSubmissionSchema = new mongoose.Schema<IExamSubmission>({
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    examID: {
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
    }
}, {
    timestamps: true,
    versionKey: false
});

examSubmissionSchema.index({ studentID: 1, examID: 1 }, { unique: true });

export const ExamSubmission = mongoose.model<IExamSubmission>("ExamSubmission", examSubmissionSchema);