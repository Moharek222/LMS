import { Router } from "express";
import examSubmissionRouter from "../exam-submission/exam-submission-router";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { createExamValidation, createExam } from "./exam-controllers/create-exam";
import { deleteExam } from "./exam-controllers/delete-exam";
import { getCourseExams } from "./exam-controllers/get-course-exams";
import { getExamForStudent } from "./exam-controllers/get-student-exam";
import { getExamForAdmin } from "./exam-controllers/get-teacher-exam";
import { updateExam, updateExamValidation } from "./exam-controllers/update-exam";

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.use("/:examID/submissions", examSubmissionRouter);
router.get("/",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getCourseExams
);

router.post("/",
    isAuthorized(Role.Admin, Role.Teacher),
    createExamValidation,
    handleValidationErrors,
    createExam
);


router.get("/:examID/student",
    isAuthorized(Role.Student),
    getExamForStudent
);


router.get("/:examID/teacher",
    isAuthorized(Role.Admin, Role.Teacher),
    getExamForAdmin
);


router.put("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    updateExamValidation,
    handleValidationErrors,
    updateExam
);


router.delete("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteExam
);

export default router;