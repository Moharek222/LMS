import apiClient from '../../../services/apiClient';
import type {
  PaginatedTeacherExamSubmissionsResponse,
  ExamSubmissionDetailsResponse,
  GradeEssayPayload,
  GradeEssayResponse,
} from '../types/examSubmission';

export const getTeacherExamSubmissions = async (
  courseId: string,
  examId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<PaginatedTeacherExamSubmissionsResponse> => {
  const response = await apiClient.get<PaginatedTeacherExamSubmissionsResponse>(
    `/api/courses/${courseId}/exams/${examId}/submissions`,
    {
      params: {
        page,
        limit,
        status,
      },
    }
  );
  return response.data;
};

export const getTeacherExamSubmissionDetails = async (
  courseId: string,
  examId: string,
  submissionId: string
): Promise<ExamSubmissionDetailsResponse> => {
  const response = await apiClient.get<ExamSubmissionDetailsResponse>(
    `/api/courses/${courseId}/exams/${examId}/submissions/${submissionId}/details`
  );
  return response.data;
};

export const gradeEssayQuestions = async (
  courseId: string,
  examId: string,
  submissionId: string,
  payload: GradeEssayPayload
): Promise<GradeEssayResponse> => {
  const response = await apiClient.put<GradeEssayResponse>(
    `/api/courses/${courseId}/exams/${examId}/submissions/${submissionId}/grade`,
    payload
  );
  return response.data;
};

export interface ExamStatisticsData {
  totalSubmissions: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  highestScore: number;
}

export interface ExamStatisticsResponse {
  message: string;
  data: ExamStatisticsData;
}

export const getExamStatistics = async (
  courseId: string,
  examId: string
): Promise<ExamStatisticsData> => {
  const response = await apiClient.get<ExamStatisticsResponse>(
    `/api/courses/${courseId}/exams/${examId}/submissions/statistics`
  );
  return response.data.data;
};

export const deleteExamSubmission = async (
  courseId: string,
  examId: string,
  submissionId: string
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/api/courses/${courseId}/exams/${examId}/submissions/${submissionId}`
  );
  return response.data;
};

export const teacherExamSubmissionsApi = {
  getTeacherExamSubmissions,
  getTeacherExamSubmissionDetails,
  gradeEssayQuestions,
  getExamStatistics,
  deleteExamSubmission,
};

export default teacherExamSubmissionsApi;
