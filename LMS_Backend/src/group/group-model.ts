import mongoose from "mongoose";
import { Grade } from "../interfaces/grade";

interface IGroup extends mongoose.Document{
    name:string,
    isActive:boolean,
    grade:Grade,
    createdAt?:Date,
    updatedAt?:Date
}


const groupSchema = new mongoose.Schema<IGroup>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    isActive: {
        type: Boolean,
        default: true
    },
    grade: {
        type: String,
        enum: Object.values(Grade),
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Group = mongoose.model<IGroup>("Group", groupSchema);