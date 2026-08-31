import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "./user-model";

import { addTeacher } from "./user-controllers/add-teacher";
import { addAdmin } from "./user-controllers/add-admin";
import { deleteAdmin } from "./user-controllers/delete-admin";

const router = Router();

router.use(isAuthenticated, isAuthorized(Role.Teacher));

router.post("/teacher", addTeacher);
router.post("/admin", addAdmin);
router.delete("/:id", deleteAdmin);

export default router;