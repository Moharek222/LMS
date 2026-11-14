import { useQuery } from '@tanstack/react-query';
import { getTeacherQuizSubmissions } from '../api/teacherQuizSubmissionsApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';

export const useTeacherQuizSubmissions = (
  lessonId: string,
  quizId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: quizQueryKeys.teacherSubmissions(lessonId, quizId, page, limit),
    queryFn: () => {
      if (!lessonId || !quizId) {
        throw new Error('Lesson ID and Quiz ID are required');
      }
      return getTeacherQuizSubmissions(lessonId, quizId, page, limit);
    },
    enabled: Boolean(lessonId && quizId),
    staleTime: 60 * 1000,
  });
};

export default useTeacherQuizSubmissions;
