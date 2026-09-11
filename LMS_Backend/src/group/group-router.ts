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
    addGroupValidation,
    handleValidationErrors,
    createGroup
);

router.put("/move-student/:studentID",
    isAuthenticated,
    moveStudentValidation,
    handleValidationErrors,
    moveStudent
);

router.put("/:groupID",
    isAuthenticated,
    updateGroupValidation,
    handleValidationErrors,
    updateGroup
);

router.get("/", getGroups);

router.get("/:groupID", getGroupById);



router.delete("/:groupID",isAuthenticated, deleteGroup);

router.get("/:groupID/students",isAuthenticated, getGroupStudents);

export default router;

