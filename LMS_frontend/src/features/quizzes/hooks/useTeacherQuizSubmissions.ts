import { useQuery } from '@tanstack/react-query';
import { getTeacherQuizSubmissions } from '../api/teacherQuizSubmissionsApi';

export const useTeacherQuizSubmissions = (
  lessonId: string,
  quizId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['teacher-quiz-submissions', lessonId, quizId, page, limit],
    queryFn: () => getTeacherQuizSubmissions(lessonId, quizId, page, limit),
    enabled: Boolean(lessonId && quizId),
  });
};
