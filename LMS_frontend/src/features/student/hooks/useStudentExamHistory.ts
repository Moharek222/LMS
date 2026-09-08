import { useQuery } from '@tanstack/react-query';
import { getStudentExamHistory } from '../api/studentHistoryApi';
import type { ExamHistoryResponse, StudentHistoryQueryParams } from '../types/studentHistory';

export const STUDENT_EXAM_HISTORY_QUERY_KEY = ['student-exam-history'] as const;

export const useStudentExamHistory = (params?: StudentHistoryQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<ExamHistoryResponse, Error>({
    queryKey: [...STUDENT_EXAM_HISTORY_QUERY_KEY, page, limit],
    queryFn: () => getStudentExamHistory(params),
  });
};

export default useStudentExamHistory;
