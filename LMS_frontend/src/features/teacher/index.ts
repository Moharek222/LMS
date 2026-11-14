// Top-level Managers
export { CourseManager } from './components/CourseManager';
export { DeactivatedStudentsManager } from './components/DeactivatedStudentsManager';
export { LessonManager } from './components/LessonManager';
export { QuizBuilder } from './components/QuizBuilder';
export { TeacherAccessCodeManager } from './components/TeacherAccessCodeManager';
export { TeacherAttendanceManager } from './components/TeacherAttendanceManager';
export { TeacherExamManager } from './components/TeacherExamManager';
export { TeacherGroupManager } from './components/TeacherGroupManager';

// Constants & Query Keys
export * from './constants/teacherQueryKeys';

// Hooks
export { useActivateStudent } from './hooks/useActivateStudent';
export { useCreateCourse } from './hooks/useCreateCourse';
export { useCreateExam } from './hooks/useCreateExam';
export { useCreateGroup } from './hooks/useCreateGroup';
export { useCreateLesson } from './hooks/useCreateLesson';
export { useCreateQuiz } from './hooks/useCreateQuiz';
export { useDeactivatedStudents } from './hooks/useDeactivatedStudents';
export { useDeactivateStudent } from './hooks/useDeactivateStudent';
export { useDeleteExam } from './hooks/useDeleteExam';
export { useDeleteGroup } from './hooks/useDeleteGroup';
export { useGenerateAccessCode } from './hooks/useGenerateAccessCode';
export { useGenerateGroupAccessCodes } from './hooks/useGenerateGroupAccessCodes';
export { useGroupStudents } from './hooks/useGroupStudents';
export { useMoveStudent } from './hooks/useMoveStudent';
export { useResetStudentPassword } from './hooks/useResetStudentPassword';
export { useTeacherAccessCodes, useStudentAccessCodes } from './hooks/useTeacherAccessCodes';
export { useTeacherAccessCodeManager } from './hooks/useTeacherAccessCodeManager';
export { useTeacherCourses } from './hooks/useTeacherCourses';
export { useTeacherExam } from './hooks/useTeacherExam';
export { useTeacherGroups } from './hooks/useTeacherGroups';
export { useUpdateCourse } from './hooks/useUpdateCourse';
export { useUpdateExam } from './hooks/useUpdateExam';
export { useUpdateGroup } from './hooks/useUpdateGroup';

// Types
export * from './types/groupManagement';

// APIs
export * as teacherApi from './api/teacherApi';
export * as teacherAccessCodesApi from './api/teacherAccessCodesApi';
export * as teacherExamsApi from './api/teacherExamsApi';
export * as teacherGroupsApi from './api/teacherGroupsApi';

