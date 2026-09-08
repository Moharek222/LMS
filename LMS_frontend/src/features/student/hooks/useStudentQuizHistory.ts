import { useQuery } from '@tanstack/react-query';
import { getStudentQuizHistory } from '../api/studentHistoryApi';
import type { QuizHistoryResponse, StudentHistoryQueryParams } from '../types/studentHistory';

export const STUDENT_QUIZ_HISTORY_QUERY_KEY = ['student-quiz-history'] as const;

export const useStudentQuizHistory = (params?: StudentHistoryQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<QuizHistoryResponse, Error>({
    queryKey: [...STUDENT_QUIZ_HISTORY_QUERY_KEY, page, limit],
    queryFn: () => getStudentQuizHistory(params),
  });
};

export default useStudentQuizHistory;
