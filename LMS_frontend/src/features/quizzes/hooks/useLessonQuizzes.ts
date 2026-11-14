import { useQuery } from '@tanstack/react-query';
import { getLessonQuizzes } from '../api/quizzesApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';
import type { QuizListItem } from '../types/quiz';

export const LESSON_QUIZZES_QUERY_KEY = ['lesson-quizzes'] as const;

export const useLessonQuizzes = (lessonId: string) => {
  return useQuery<QuizListItem[], Error>({
    queryKey: quizQueryKeys.lessonQuizzes(lessonId),
    queryFn: () => {
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }
      return getLessonQuizzes(lessonId);
    },
    enabled: Boolean(lessonId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useLessonQuizzes;
