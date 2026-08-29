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

const router = Router();

// Only admin/teacher can manage groups
router.use(isAuthenticated, isAuthorized(Role.Admin, Role.Teacher));

router.post("/",
    addGroupValidation,
    handleValidationErrors,
    createGroup
);

router.get("/", getGroups);

router.get("/:id", getGroupById);

router.put("/:id",
    updateGroupValidation,
    handleValidationErrors,
    updateGroup
);

router.delete("/:id", deleteGroup);

router.get("/:id/students", getGroupStudents);

export default router;

