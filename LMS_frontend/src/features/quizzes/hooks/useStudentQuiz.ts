import { useQuery } from '@tanstack/react-query';
import { getStudentQuiz } from '../api/quizzesApi';
import type { StudentQuiz } from '../types/quiz';

export const STUDENT_QUIZ_QUERY_KEY = ['student-quiz'] as const;

export const useStudentQuiz = (lessonId: string, quizId: string) => {
  return useQuery<StudentQuiz, Error>({
    queryKey: [...STUDENT_QUIZ_QUERY_KEY, lessonId, quizId],
    queryFn: () => getStudentQuiz(lessonId, quizId),
    enabled: Boolean(lessonId && quizId),
  });
};

export default useStudentQuiz;
