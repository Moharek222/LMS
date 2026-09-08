import apiClient from '../../../services/apiClient';
import type {
  QuizHistoryResponse,
  ExamHistoryResponse,
  StudentHistoryQueryParams,
} from '../types/studentHistory';

export const getStudentQuizHistory = async (
  params?: StudentHistoryQueryParams
): Promise<QuizHistoryResponse> => {
  const response = await apiClient.get<QuizHistoryResponse>(
    '/api/students/quiz-history',
    { params }
  );
  return response.data;
};

export const getStudentExamHistory = async (
  params?: StudentHistoryQueryParams
): Promise<ExamHistoryResponse> => {
  const response = await apiClient.get<ExamHistoryResponse>(
    '/api/students/exam-history',
    { params }
  );
  return response.data;
};

export const studentHistoryApi = {
  getStudentQuizHistory,
  getStudentExamHistory,
};

export default studentHistoryApi;
