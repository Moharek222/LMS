import { Router } from "express";
import { scanStudentAttendance } from "./attendace-controllers/scan-student-attendance";
import { getGroupAttendance } from "./attendace-controllers/get-group-attendance";
import { getAttendanceById } from "./attendace-controllers/get-attendance-by-id";
import { getStudentAttendancePercentage } from "./attendace-controllers/get-student-attendance-percentage";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getMyAttendancePercentage } from "./attendace-controllers/get-my-attendance-percentage";



const router = Router({ mergeParams: true });

router.post("/",scanStudentAttendance);

router.get("/sheets",getGroupAttendance);

router.get("/sheet/:attendanceID",getAttendanceById);


router.get("/student-percentage/:studentID",
    // isAuthorized(Role.Admin, Role.Teacher),
    getStudentAttendancePercentage
);
router.get("/my-percentage",
    // isAuthorized(Role.Student),
    getMyAttendancePercentage
);


export default router;
