import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { addCourse, addCourseValidation } from "./course-controllers/add-course";
import { getCourses } from "./course-controllers/get-courses";
import { getCourseById } from "./course-controllers/get-course-by-id";
import { updateCourse, updateCourseValidation } from "./course-controllers/update-course";
import { deleteCourse } from "./course-controllers/delete-course";
import { getStudentCourses } from "./course-controllers/get-student-courses";
import examRouter from "../exam/exam-router";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";


const router = Router();
router.use(isAuthenticated)

router.use("/:courseID/exams", examRouter);


router.get("/student",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getStudentCourses);

router.post("/",
    isAuthorized(Role.Admin, Role.Teacher),
    addCourseValidation,
    handleValidationErrors,
    addCourse
);

router.get("/",
    isAuthorized(Role.Admin, Role.Teacher),
    getCourses
);
router.get("/:courseID",
    isAuthorized(Role.Student,Role.Admin, Role.Teacher),
    getCourseById
);

router.put("/:courseID",
    isAuthorized(Role.Admin, Role.Teacher),
    updateCourseValidation,
    handleValidationErrors,
    updateCourse
);

router.delete("/:courseID",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteCourse
);

export default router;