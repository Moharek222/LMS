import apiClient from '../../../services/apiClient';
import type {
  GetTeacherQuizResponse,
  UpdateQuizPayload,
  UpdateQuizResponse,
  DeleteQuizResponse,
  TeacherQuiz,
} from '../types/quiz';

export const getTeacherQuiz = async (
  lessonId: string,
  quizId: string
): Promise<TeacherQuiz> => {
  const response = await apiClient.get<GetTeacherQuizResponse>(
    `/api/lessons/${lessonId}/quizzes/${quizId}/teacher`
  );
  return response.data.data;
};

export const updateQuiz = async (
  lessonId: string,
  quizId: string,
  payload: UpdateQuizPayload
): Promise<TeacherQuiz> => {
  const response = await apiClient.put<UpdateQuizResponse>(
    `/api/lessons/${lessonId}/quizzes/${quizId}`,
    payload
  );
  return response.data.data;
};

export const deleteQuiz = async (
  lessonId: string,
  quizId: string
): Promise<DeleteQuizResponse> => {
  const response = await apiClient.delete<DeleteQuizResponse>(
    `/api/lessons/${lessonId}/quizzes/${quizId}`
  );
  return response.data;
};

export const teacherQuizzesApi = {
  getTeacherQuiz,
  updateQuiz,
  deleteQuiz,
};

export default teacherQuizzesApi;
