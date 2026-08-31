import { Router } from "express";
import { getMySubmissionsQuiz } from "../quiz-submission/quiz-submission-controllers/get-my-submission";
import { getMySubmissionsExams } from "../exam-submission/exam-submission-controllers/get-my-submission";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";


import { getProfile } from "./student-controllers/get-profile";
import { updateProfile, updateProfileValidation } from "./student-controllers/update-profile";
import { updatePassword, updatePasswordValidation } from "./student-controllers/update-password";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

const router = Router();

router.use(isAuthenticated);
// Only allow students to access these endpoints
router.use(isAuthorized(Role.Student));

// Get the student's profile information
router.get("/profile", getProfile);

// Update the student's profile information (name, phone, parentPhone)
router.put("/profile",
    updateProfileValidation,
    handleValidationErrors,
    updateProfile
);

// Update the student's password
router.patch("/password",
    updatePasswordValidation,
    handleValidationErrors,
    updatePassword
);

// Quiz history
router.get("/quiz-history", getMySubmissionsQuiz)
// Exam history
router.get("/exam-history", getMySubmissionsExams)

export default router;