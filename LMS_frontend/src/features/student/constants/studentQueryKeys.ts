export const studentQueryKeys = {
  all: ['student'] as const,
  profile: () => ['student-profile'] as const,
  activeGroups: () => ['active-groups-profile'] as const,
  quizHistory: (page?: number, limit?: number) =>
    ['student-quiz-history', page, limit] as const,
  examHistory: (page?: number, limit?: number) =>
    ['student-exam-history', page, limit] as const,
};

