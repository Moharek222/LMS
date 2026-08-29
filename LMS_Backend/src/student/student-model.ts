import mongoose from "mongoose";
import { Role } from "../user/user-model";


interface IStudent extends mongoose.Document {
    groupID: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    password:string;
    parentPhone?: string;
    role:Role;
    isActive: boolean;
    activeToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const studentSchema = new mongoose.Schema<IStudent>({
    groupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
        minlength: 4
    },
    role : {
        type: String,
        enum: Object.values(Role),
        default: Role.Student
    },
    parentPhone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    activeToken: {
        type: String,
        default: null,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Student = mongoose.model<IStudent>("Student", studentSchema);