import mongoose from "mongoose";

interface IAttendance extends mongoose.Document {
    groupId: mongoose.Schema.Types.ObjectId;
    date: Date;
    presentStudents: mongoose.Schema.Types.ObjectId[]; 
    createdAt?: Date;
    updatedAt?: Date;
}

const attendanceSchema = new mongoose.Schema<IAttendance>({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: () => new Date(new Date().setHours(0, 0, 0, 0)) 
    },
    presentStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }]
}, {
    timestamps: true,
    versionKey: false
});

attendanceSchema.index({ groupId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);