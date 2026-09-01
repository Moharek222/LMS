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
import { getQuizForAdmin } from "./quiz-controllers/get-teacher-quiz";
import quizSubmissionRouter from "../quiz-submission/quiz-submission-router";
const router = Router({ mergeParams: true });

// router.use(isAuthenticated);

router.use("/:quizID/submissions", quizSubmissionRouter);
router.get("/",
    // isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getLessonQuizzes
);

router.post("/",
    // isAuthorized(Role.Admin, Role.Teacher),
    createQuizValidation,
    handleValidationErrors,
    createQuiz
);


router.get("/:quizID/student",
    // isAuthorized(Role.Student),
    getQuizForStudent
);


router.get("/:quizID/teacher",
    // isAuthorized(Role.Admin, Role.Teacher),
    getQuizForAdmin
);


router.put("/:id",
    // isAuthorized(Role.Admin, Role.Teacher),
    updateQuizValidation,
    handleValidationErrors,
    updateQuiz
);


router.delete("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteQuiz
);

export default router;