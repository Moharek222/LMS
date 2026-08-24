import mongoose from "mongoose";

export interface ILesson extends mongoose.Document {
    title: string;
    courseID: mongoose.Schema.Types.ObjectId;
    description?: string;
    contentUrl: string;
    order: number;
    requiresPassing: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const lessonSchema = new mongoose.Schema<ILesson>({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    description: {
        type: String,
        required: false,
        trim: true,
        minlength: 3
    },
    contentUrl: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    order: {
        type: Number,
        required: true
    },
    requiresPassing: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);