import mongoose from "mongoose";


interface ICourse extends mongoose.Document {
    title: string;
    isActive: boolean;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const courseSchema = new mongoose.Schema<ICourse>({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Course = mongoose.model<ICourse>("Course", courseSchema);