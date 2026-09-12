import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { createGroup, addGroupValidation } from "./group-controllers/create-group";
import { getGroups } from "./group-controllers/get-groups";
import { getGroupById } from "./group-controllers/get-group-by-id";
import { updateGroup, updateGroupValidation } from "./group-controllers/update-group";
import { deleteGroup } from "./group-controllers/delete-group";
import { getGroupStudents } from "./group-controllers/get-students-group";
import { moveStudent, moveStudentValidation } from "./group-controllers/move-student";
import attendanceRouter from "../attendance/attendance-router";

const router = Router();


router.use("/:groupID/attendance",attendanceRouter);

router.post("/",
    isAuthenticated,
    isAuthorized(Role.Admin, Role.Teacher),
    addGroupValidation,
    handleValidationErrors,
    createGroup
);

router.put("/move-student/:studentID",
    isAuthenticated,
    isAuthorized(Role.Admin, Role.Teacher),
    moveStudentValidation,
    handleValidationErrors,
    moveStudent
);

router.put("/:groupID",
    isAuthenticated,
    isAuthorized(Role.Admin, Role.Teacher),
    updateGroupValidation,
    handleValidationErrors,
    updateGroup
);

router.get("/", getGroups);

router.get("/:groupID", getGroupById);

router.delete("/:groupID",
    isAuthenticated,
    isAuthorized(Role.Admin, Role.Teacher),
    deleteGroup);

router.get("/:groupID/students",
    isAuthenticated,
    isAuthorized(Role.Admin, Role.Teacher),
    getGroupStudents);

export default router;

