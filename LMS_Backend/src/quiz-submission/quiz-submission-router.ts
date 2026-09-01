import { Router } from "express";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getStudentsSubmissions } from "./quiz-submission-controllers/get-students-submissions";
import { submitQuiz } from "./quiz-submission-controllers/submit-quiz";
import { getSubmissionById } from "./quiz-submission-controllers/get-submission-by-id";

const router = Router({ mergeParams: true });

router.post("/",
    // isAuthorized(Role.Student),
    submitQuiz
);

router.get("/",
    // isAuthorized(Role.Admin, Role.Teacher),
    getStudentsSubmissions
);

router.get("/:id",
    // isAuthorized(Role.Student),
    getSubmissionById
);

export default router;