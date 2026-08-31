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


const router = Router();


router.use("/:coureseID/exams", examRouter);


router.get("/student", isAuthorized(Role.Student), getStudentCourses);

router.post("/",
    addCourseValidation,
    handleValidationErrors,
    addCourse
);

router.get("/",
    getCourses
);

router.get("/:id",
    getCourseById
);

router.put("/:id",
    updateCourseValidation,
    handleValidationErrors,
    updateCourse
);

router.delete("/:id",
    deleteCourse
);

export default router;