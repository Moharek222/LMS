import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "./user-model";

import { addTeacher } from "./user-controllers/add-teacher";
import { addAdmin } from "./user-controllers/add-admin";

const router = Router();

router.use(isAuthenticated, isAuthorized(Role.Admin));

router.post("/teacher", addTeacher);
router.post("/admin", addAdmin);

export default router;