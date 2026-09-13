import { Router } from "express";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getStudentsSubmissions } from "./quiz-submission-controllers/get-students-submissions";
import { submitQuiz, submitQuizValidation } from "./quiz-submission-controllers/submit-quiz";
import { getSubmissionById } from "./quiz-submission-controllers/get-submission-by-id";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";

const router = Router({ mergeParams: true });
router.use(isAuthenticated);

router.post("/",
    isAuthorized(Role.Student),
    submitQuizValidation,
    handleValidationErrors,
    submitQuiz
);

router.get("/",
    isAuthorized(Role.Admin, Role.Teacher),
    getStudentsSubmissions
);

router.get("/:id",
    isAuthorized(Role.Student),
    getSubmissionById
);

export default router;