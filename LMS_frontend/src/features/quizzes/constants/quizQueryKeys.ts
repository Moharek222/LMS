export const quizQueryKeys = {
  all: ['quizzes'] as const,
  lessonQuizzes: (lessonId?: string) => ['lesson-quizzes', lessonId] as const,
  studentQuiz: (lessonId?: string, quizId?: string) =>
    ['student-quiz', lessonId, quizId] as const,
  teacherQuiz: (lessonId?: string, quizId?: string) =>
    ['teacher-quiz', lessonId, quizId] as const,
  teacherSubmissions: (
    lessonId?: string,
    quizId?: string,
    page?: number,
    limit?: number
  ) =>
    ['teacher-quiz-submissions', lessonId, quizId, page, limit] as const,
  studentHistory: () => ['student-quiz-history'] as const,
};

