import mongoose from "mongoose";
import { Role } from "../user/user-model";
import { Grade } from "../interfaces/grade";


interface IStudent extends mongoose.Document {
    groupID?: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    password:string;
    parentPhone?: string | null;
    role:Role;
    grade:Grade
    isActive: boolean;
    activeToken?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const studentSchema = new mongoose.Schema<IStudent>({
    groupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: false
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
    grade: {
        type: String,
        enum: Object.values(Grade),
        required: true
    },
    parentPhone: {
        type: String,
        trim: true,
        default: null
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