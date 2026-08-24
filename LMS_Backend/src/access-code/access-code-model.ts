import mongoose from "mongoose";


enum Status {
    Active = "active",
    Expired = "expired",
    Revoked = "revoked"
}

interface IAccessCode extends mongoose.Document {
    studentId: mongoose.Schema.Types.ObjectId,
    code: string,
    startAt:Date,
    expiresAt: Date,
    revokedAt?: Date | null,
    status: Status,
    createdAt?: Date,
    updatedAt?: Date
}


const accessCodeSchema = new mongoose.Schema<IAccessCode>({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    startAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    revokedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.Active
    }
}, {
    timestamps: true,
    versionKey: false
});

export const AccessCode = mongoose.model<IAccessCode>("AccessCode", accessCodeSchema);