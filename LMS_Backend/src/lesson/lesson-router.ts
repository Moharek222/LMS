import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { createLesson, addLessonValidation } from "./lesson-controllers/create-lesson";
import { updateLesson, updateLessonValidation } from "./lesson-controllers/update-lesson";
import { deleteLesson } from "./lesson-controllers/delete-lesson";
import { getLessonById } from "./lesson-controllers/get-lesson-by-id";
import { getCourseLessons } from "./lesson-controllers/get-course-lessons";
import { generateUploadUrl, generateUploadUrlValidation } from "./lesson-controllers/upload-controller";

const router = Router();

router.use(isAuthenticated);

router.post("/generate-upload-url",
    isAuthorized(Role.Admin, Role.Teacher),
    generateUploadUrlValidation,
    handleValidationErrors,
    generateUploadUrl
);
router.post("/",
    isAuthorized(Role.Admin, Role.Teacher),
    addLessonValidation,
    handleValidationErrors,
    createLesson
);

router.put("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    updateLessonValidation,
    handleValidationErrors,
    updateLesson
);

router.delete("/:id",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteLesson
);

router.get("/:lessonId/video",
    getLessonById
);

// Get All Lessons for a specific course (Students and Teachers/Admins)
router.get("/course/:courseId",
    getCourseLessons
);

export default router;
