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

export const uploadQuizQuestionImage = async (
  lessonId: string,
  file: File
): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<{ message: string; data: { imageUrl: string } }>(
    `/api/lessons/${lessonId}/quizzes/upload-image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

export const teacherQuizzesApi = {
  getTeacherQuiz,
  updateQuiz,
  deleteQuiz,
  uploadQuizQuestionImage,
};

export default teacherQuizzesApi;
