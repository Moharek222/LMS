export const courseQueryKeys = {
  all: ['courses'] as const,
  student: () => ['student-courses'] as const,
  teacher: () => ['teacher-courses'] as const,
  details: (id?: string) => ['course-details', id] as const,
};

