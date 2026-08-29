import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { addCourse, addCourseValidation } from "./course-controllers/add-course";
import { getCourses } from "./course-controllers/get-courses";
import { getCourseById } from "./course-controllers/get-course-by-id";
import { updateCourse, updateCourseValidation } from "./course-controllers/update-course";
import { deleteCourse } from "./course-controllers/delete-course";
import { getStudentCourses } from "./course-controllers/get-student-courses";

const router = Router();

router.use(isAuthenticated);


router.get("/student", isAuthorized(Role.Student), getStudentCourses);

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

router.get("/:id",
    isAuthorized(Role.Admin, Role.Teacher, Role.Student),
    getCourseById
);

router.put("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    updateCourseValidation,
    handleValidationErrors,
    updateCourse
);

router.delete("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteCourse
);

export default router;