import apiClient from '../../../services/apiClient';
import type {
  QuizHistoryResponse,
  ExamHistoryResponse,
  StudentHistoryQueryParams,
} from '../types/studentHistory';

export const getStudentQuizHistory = async (
  params?: StudentHistoryQueryParams
): Promise<QuizHistoryResponse> => {
  try {
    const response = await apiClient.get<QuizHistoryResponse>(
      '/api/students/quiz-history',
      {
        params,
        headers: {
          'X-Skip-Auth-Redirect': 'true',
        },
      }
    );
    return response.data;
  } catch {
    return {
      message: 'سجل الكويزات',
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      data: [],
    };
  }
};

export const getStudentExamHistory = async (
  params?: StudentHistoryQueryParams
): Promise<ExamHistoryResponse> => {
  try {
    const response = await apiClient.get<ExamHistoryResponse>(
      '/api/students/exam-history',
      {
        params,
        headers: {
          'X-Skip-Auth-Redirect': 'true',
        },
      }
    );
    return response.data;
  } catch {
    return {
      message: 'سجل الامتحانات',
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      data: [],
    };
  }
};

export const studentHistoryApi = {
  getStudentQuizHistory,
  getStudentExamHistory,
};

export default studentHistoryApi;
