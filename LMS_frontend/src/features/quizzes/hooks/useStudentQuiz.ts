import { useQuery } from '@tanstack/react-query';
import { getStudentQuiz } from '../api/quizzesApi';
import type { StudentQuiz } from '../types/quiz';

export const STUDENT_QUIZ_QUERY_KEY = ['student-quiz'] as const;

export const useStudentQuiz = (quizId: string) => {
  return useQuery<StudentQuiz, Error>({
    queryKey: [...STUDENT_QUIZ_QUERY_KEY, quizId],
    queryFn: () => getStudentQuiz(quizId),
    enabled: Boolean(quizId),
  });
};

export default useStudentQuiz;
