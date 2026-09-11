import { Router } from "express";
import { getMySubmissionsQuiz } from "../quiz-submission/quiz-submission-controllers/get-my-submission";
import { getMySubmissions } from "../exam-submission/exam-submission-controllers/get-my-submission";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";


import { getProfile } from "./student-controllers/get-me";
import { updateProfile, updateProfileValidation } from "./student-controllers/update-me";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getStudents } from "./student-controllers/get-students";

const router = Router();

router.use(isAuthenticated);



router.get("/", getStudents);

router.get("/me", getProfile);

router.put("/profile",
    updateProfileValidation,
    handleValidationErrors,
    updateProfile
);
// Quiz history
router.get("/quiz-history", getMySubmissionsQuiz)
// Exam history
router.get("/exam-history",
    isAuthorized(Role.Student),
    getMySubmissions)

export default router;