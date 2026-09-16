import { Router } from "express";
import { markLessonAsWatched } from "./progress-controllers/mark-lesson-as-watched";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { getStudentWatchHistory } from "./progress-controllers/get-student-watch-history";



const router = Router();


router.use(isAuthenticated);

router.post("/",markLessonAsWatched);

router.get("/watch-history/:studentID",getStudentWatchHistory);

export default router;