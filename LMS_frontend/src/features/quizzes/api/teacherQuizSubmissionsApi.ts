import apiClient from '../../../services/apiClient';

export interface TeacherQuizSubmissionStudentInfo {
  _id: string;
  name: string;
  phone?: string;
}

export interface TeacherQuizSubmissionItem {
  _id: string;
  quizID: {
    _id: string;
    title: string;
  };
  studentID: TeacherQuizSubmissionStudentInfo;
  score: number;
  isPassed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTeacherQuizSubmissionsResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: TeacherQuizSubmissionItem[];
}

export const getTeacherQuizSubmissions = async (
  lessonId: string,
  quizId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTeacherQuizSubmissionsResponse> => {
  const response = await apiClient.get<PaginatedTeacherQuizSubmissionsResponse>(
    `/api/lessons/${lessonId}/quizzes/${quizId}/submissions`,
    {
      params: {
        page,
        limit,
      },
    }
  );
  return response.data;
};

export const teacherQuizSubmissionsApi = {
  getTeacherQuizSubmissions,
};

export default teacherQuizSubmissionsApi;
