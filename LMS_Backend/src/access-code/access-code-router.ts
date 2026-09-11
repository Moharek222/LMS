import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { generateStudentAccessCode, generateCodeValidation } from "./access-code-contollers/generate-access-code";
import { getAllAccessCode } from "./access-code-contollers/get-all-access-code";
import { getAccessCodes } from "./access-code-contollers/get-student-access-codes";
import { verifyAccessCode, verifyCodeValidation } from "./access-code-contollers/verify-access-code";

const router = Router();

router.use(isAuthenticated);

// Admin / Teacher routes
router.post("/generate",
    isAuthorized(Role.Admin, Role.Teacher),
    generateCodeValidation,
    handleValidationErrors,
    generateStudentAccessCode
);

router.get("/",
    isAuthorized(Role.Admin, Role.Teacher),
    getAllAccessCode
);

router.get("/student/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    getAccessCodes
);

// Student routes
router.post("/verify",
    isAuthorized(Role.Student),
    verifyCodeValidation,
    handleValidationErrors,
    verifyAccessCode
);

export default router;

