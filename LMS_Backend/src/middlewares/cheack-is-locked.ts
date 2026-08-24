// import { Request, Response, NextFunction, RequestHandler } from "express";
// import { Lesson } from "../lesson/lesson-model";
// import { Test } from "../test/test-model";
// import { TestSubmission } from "../testSubmission/testSubmission-model";

// export const checkIsLocked :RequestHandler<{ id: string }> = async (req, res, next ) => {
//     try {
//         const  lessonID  = req.params.id;
//         const userId = req.user?.id;

//         const currentLesson = await Lesson.findById(lessonID);
//         if (!currentLesson) {
//             return res.status(404).json({ message: "Lesson not found" });
//         }

//         if (currentLesson.isFreePreview || currentLesson.lessonOrder === 1) {
//             return next();
//         }

//         const previousLesson = await Lesson.findOne({
//             courseID: currentLesson.courseID,
//             lessonOrder: currentLesson.lessonOrder - 1
//         });

//         if (!previousLesson) {
//             return next();
//         }

//         const previousLessonTest = await Test.findOne({ lessonID: previousLesson._id });

//         if (!previousLessonTest) {
//             return next();
//         }


//         const passedSubmission = await TestSubmission.findOne({
//             studentID: userId,
//             testID: previousLessonTest._id,
//             isPassed: true
//         });

//         if (!passedSubmission) {
//             return res.status(403).json({
//                 success: false,
//                 isLocked: true,
//                 message: "You should pass the previous lesson test"
//             });
//         }

//         next();
//     } catch (error) {
//         console.error("Error in checkIsLocked middleware:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };