import mongoose from "mongoose";

export enum Role {
    Admin= "admin",
    Teacher= "teacher"
}

export interface IUser extends mongoose.Document{
    name: string;
    email: string;
    password: string;
    role:Role
    isActive:boolean;
    createdAt?:Date
    updatedAt?:Date
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String, 
        required: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role:{
        type:String,
        enum: Object.values(Role),
        default:Role.Teacher
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, {
    timestamps: true,
    versionKey:false
});

export const User = mongoose.model<IUser>("User", userSchema);
