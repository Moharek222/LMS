import mongoose from "mongoose";

interface IGroup extends mongoose.Document{
    name:string,
    level:string,
    isActive:boolean
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
    level: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Group = mongoose.model<IGroup>("Group", groupSchema);