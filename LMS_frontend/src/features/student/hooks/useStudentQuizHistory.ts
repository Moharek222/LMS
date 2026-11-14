import { useQuery } from '@tanstack/react-query';
import { getStudentQuizHistory } from '../api/studentHistoryApi';
import { studentQueryKeys } from '../constants/studentQueryKeys';
import type { QuizHistoryResponse, StudentHistoryQueryParams } from '../types/studentHistory';
import { useAuth } from '../../../context/useAuth';

export const STUDENT_QUIZ_HISTORY_QUERY_KEY = ['student-quiz-history'] as const;

export const useStudentQuizHistory = (params?: StudentHistoryQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;
  const { user } = useAuth();

  return useQuery<QuizHistoryResponse, Error>({
    queryKey: studentQueryKeys.quizHistory(page, limit),
    queryFn: () => getStudentQuizHistory(params),
    enabled: Boolean(user && (user.role === 'student' || (user.role as string) === 'STUDENT')),
    staleTime: 2 * 60 * 1000,
  });
};

export default useStudentQuizHistory;
