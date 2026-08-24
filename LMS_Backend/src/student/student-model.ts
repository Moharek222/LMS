import mongoose from "mongoose";


interface IStudent extends mongoose.Document {
    groupId: mongoose.Schema.Types.ObjectId;
    name: string;
    phone: string;
    parentPhone?: string;
    isActive: boolean;
    activeToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const studentSchema = new mongoose.Schema<IStudent>({
    groupId: {
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