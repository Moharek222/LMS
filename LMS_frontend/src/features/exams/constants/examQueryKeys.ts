export const examQueryKeys = {
  all: ['exams'] as const,
  courseExams: (courseId?: string) => ['course-exams', courseId] as const,
  studentExam: (courseId?: string, examId?: string) =>
    ['student-exam', courseId, examId] as const,
  teacherExam: (courseId?: string, examId?: string) =>
    ['teacher-exam', courseId, examId] as const,
  statistics: (courseId?: string, examId?: string) =>
    ['examStatistics', courseId, examId] as const,
  teacherSubmissions: (
    courseId?: string,
    examId?: string,
    page?: number,
    limit?: number,
    status?: string
  ) =>
    ['teacher-exam-submissions', courseId, examId, page, limit, status] as const,
  teacherSubmissionDetails: (
    courseId?: string,
    examId?: string,
    submissionId?: string | null
  ) =>
    ['teacher-exam-submission-details', courseId, examId, submissionId] as const,
  studentHistory: () => ['student-exam-history'] as const,
};

