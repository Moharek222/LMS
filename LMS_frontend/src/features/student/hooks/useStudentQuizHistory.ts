import { useQuery } from '@tanstack/react-query';
import { getStudentQuizHistory } from '../api/studentHistoryApi';
import type { QuizHistoryResponse, StudentHistoryQueryParams } from '../types/studentHistory';
import { useAuth } from '../../../context/useAuth';

export const STUDENT_QUIZ_HISTORY_QUERY_KEY = ['student-quiz-history'] as const;

export const useStudentQuizHistory = (params?: StudentHistoryQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;
  const { user } = useAuth();

  return useQuery<QuizHistoryResponse, Error>({
    queryKey: [...STUDENT_QUIZ_HISTORY_QUERY_KEY, page, limit],
    queryFn: () => getStudentQuizHistory(params),
    enabled: Boolean(user && (user.role === 'student' || (user.role as string) === 'STUDENT')),
  });
};

export default useStudentQuizHistory;
