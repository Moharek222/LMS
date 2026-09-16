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
import { resetPasswordValidation, resetStudentPassword } from "./student-controllers/reset-student-password";
import { deactivateStudent } from "./student-controllers/deactivate-student";

const router = Router();

router.use(isAuthenticated);



router.get("/",
    isAuthorized(Role.Admin, Role.Teacher),
    getStudents);

router.get("/me",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getProfile);

router.post("/reset-password/:studentID",
    isAuthorized(Role.Admin, Role.Teacher),
    resetPasswordValidation,
    handleValidationErrors,
    resetStudentPassword
);

router.put("/profile",
    updateProfileValidation,
    handleValidationErrors,
    updateProfile
);

router.put("/profile",
    updateProfileValidation,
    handleValidationErrors,
    updateProfile
);
router.put("/deactivate/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    deactivateStudent
);



// Quiz history
router.get("/quiz-history", getMySubmissionsQuiz)
// Exam history
router.get("/exam-history",
    isAuthorized(Role.Student),
    getMySubmissions)

export default router;