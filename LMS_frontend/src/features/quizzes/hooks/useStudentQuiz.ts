import { useQuery } from '@tanstack/react-query';
import { getStudentQuiz } from '../api/quizzesApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';
import type { StudentQuiz } from '../types/quiz';

export const STUDENT_QUIZ_QUERY_KEY = ['student-quiz'] as const;

export const useStudentQuiz = (lessonId: string, quizId: string) => {
  return useQuery<StudentQuiz, Error>({
    queryKey: quizQueryKeys.studentQuiz(lessonId, quizId),
    queryFn: () => {
      if (!lessonId || !quizId) {
        throw new Error('Lesson ID and Quiz ID are required');
      }
      return getStudentQuiz(lessonId, quizId);
    },
    enabled: Boolean(lessonId && quizId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useStudentQuiz;
