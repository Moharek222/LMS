import { Router } from "express";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { submitExam } from "./exam-submission-controllers/submit-exam";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { getMySubmissions } from "./exam-submission-controllers/get-my-submission";
import { getExamSubmission } from "./exam-submission-controllers/get-exam-submission";
import { getExamStatistics } from "./exam-submission-controllers/get-exam-statistics";
import { getSubmissionDetails } from "./exam-submission-controllers/get-submission-details";
import { getSubmissionResult } from "./exam-submission-controllers/get-submission-result";
import { gradeEssayQuestions } from "./exam-submission-controllers/grade-essay";
import { deleteSubmission } from "./exam-submission-controllers/delete-submission";
import { requireActiveSubscription } from "../middlewares/is-active-code";

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.get("/statistics",
    isAuthorized(Role.Admin, Role.Teacher), 
    getExamStatistics
);

router.get("/",
    isAuthorized(Role.Admin, Role.Teacher),
    getExamSubmission
);


router.post("/",
    isAuthorized(Role.Student),
    requireActiveSubscription,
    submitExam
);

router.put("/:submissionID/grade",
    isAuthorized(Role.Admin, Role.Teacher),
    gradeEssayQuestions
);


router.get("/:submissionID/details",
    isAuthorized(Role.Student,Role.Admin, Role.Teacher),
    requireActiveSubscription,
    getSubmissionDetails
);

router.get("/:submissionID/result",
    isAuthorized(Role.Student),
    requireActiveSubscription,
    getSubmissionResult
);
router.delete("/:submissionID",
    isAuthorized(Role.Admin, Role.Teacher),
    deleteSubmission
)

export default router;