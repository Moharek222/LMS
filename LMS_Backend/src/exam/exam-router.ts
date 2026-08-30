import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { createExam, createExamValidation } from "./exam-controllers/create-exam";
import { updateExam, updateExamValidation } from "./exam-controllers/update-exam";
import { deleteExam } from "./exam-controllers/delete-exam";
import { getCourseExams } from "./exam-controllers/get-course-exams";
import { getExamForStudent } from "./exam-controllers/get-student-exam";
import { getExamForAdmin } from "./exam-controllers/get-teacher-exam";

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.get("/",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getCourseExams
);

router.get("/student/:examID",
    isAuthorized(Role.Student),
    getExamForStudent
);

router.get("/teacher/:examID",
    isAuthorized(Role.Admin, Role.Teacher),
    getExamForAdmin
);

router.post("/",
    isAuthorized(Role.Admin, Role.Teacher),
    createExamValidation,
    handleValidationErrors,
    createExam
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

