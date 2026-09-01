import { Router } from "express";
import { getMySubmissionsQuiz } from "../quiz-submission/quiz-submission-controllers/get-my-submission";
import { getMySubmissionsExams } from "../exam-submission/exam-submission-controllers/get-my-submission";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";


import { getProfile } from "./student-controllers/get-profile";
import { updateProfile, updateProfileValidation } from "./student-controllers/update-profile";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getStudents } from "./student-controllers/get-students";

const router = Router();

// router.use(isAuthenticated);
// Only allow students to access these endpoints
// router.use(isAuthorized(Role.Student));


router.get("/", getStudents);

router.get("/profile", getProfile);

router.put("/profile",
    updateProfileValidation,
    handleValidationErrors,
    updateProfile
);
// Quiz history
router.get("/quiz-history", getMySubmissionsQuiz)
// Exam history
router.get("/exam-history", getMySubmissionsExams)

export default router;