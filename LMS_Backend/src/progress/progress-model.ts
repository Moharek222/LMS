import mongoose from "mongoose";

interface IProgress extends mongoose.Document {
    studentID: mongoose.Types.ObjectId;
    courseID: mongoose.Types.ObjectId;
    watchedLessons: mongoose.Types.ObjectId[]; 
}

const progressSchema = new mongoose.Schema<IProgress>({
    studentID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student", 
        required: true 
    },
    courseID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Course", 
        required: true 
    },
    watchedLessons: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Lesson" 
    }]
}, { timestamps: true, versionKey: false });

progressSchema.index({ studentID: 1, courseID: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>("Progress", progressSchema);