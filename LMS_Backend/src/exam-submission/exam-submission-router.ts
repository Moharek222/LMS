import { Router } from "express";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getStudentsSubmissions } from "./exam-submission-controllers/get-students-submissions";
import { getSubmissionById } from "./exam-submission-controllers/get-submission-by-id";
import { submitExam } from "./exam-submission-controllers/submit-exam";

const router = Router({ mergeParams: true });

router.post("/",
    // isAuthorized(Role.Student),
    submitExam
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