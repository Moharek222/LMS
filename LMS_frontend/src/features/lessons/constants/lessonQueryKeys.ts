export const lessonQueryKeys = {
  all: ['lessons'] as const,
  courseLessons: (courseId?: string) => ['course-lessons', courseId] as const,
  lessonVideo: (lessonId?: string) => ['lesson-video', lessonId] as const,
  watchHistory: (courseId?: string) => ['watch-history', courseId] as const,
  studentLessons: () => ['student-lessons'] as const,
  studentWatchHistory: (studentId?: string) =>
    ['student-watch-history', studentId] as const,
};

