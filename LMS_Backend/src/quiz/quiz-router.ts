import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { createQuiz, createQuizValidation } from "./quiz-controllers/create-quiz";
import { updateQuiz, updateQuizValidation } from "./quiz-controllers/update-quiz";
import { deleteQuiz } from "./quiz-controllers/delete-quiz";
import { getLessonQuizzes } from "./quiz-controllers/get-lesson-quizzes";
import { getQuizForStudent } from "./quiz-controllers/get-student-quiz";

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

// Get All Quizzes for a specific lesson (Students and Teachers/Admins)
router.get("/lesson/:lessonId",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getLessonQuizzes
);

// Get Quiz by ID (Students and Teachers/Admins)
router.get("/:id",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getQuizForStudent
);

// Create Quiz (Teacher/Admin only)
router.post("/:lessonID",
    isAuthorized(Role.Admin, Role.Teacher),
    createQuizValidation,
    handleValidationErrors,
    createQuiz
);

// Update Quiz (Teacher/Admin only)
router.put("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    updateQuizValidation,
    handleValidationErrors,
    updateQuiz
);

// Delete Quiz (Soft Delete) (Teacher/Admin only)
router.delete("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteQuiz
);

export default router;