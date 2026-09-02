import { useQuery } from '@tanstack/react-query';
import { getLessonQuizzes } from '../api/quizzesApi';
import type { QuizListItem } from '../types/quiz';

export const LESSON_QUIZZES_QUERY_KEY = ['lesson-quizzes'] as const;

export const useLessonQuizzes = (lessonId: string) => {
  return useQuery<QuizListItem[], Error>({
    queryKey: [...LESSON_QUIZZES_QUERY_KEY, lessonId],
    queryFn: () => getLessonQuizzes(lessonId),
    enabled: Boolean(lessonId),
  });
};

export default useLessonQuizzes;
