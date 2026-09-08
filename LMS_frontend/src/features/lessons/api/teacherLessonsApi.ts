import apiClient from '../../../services/apiClient';
import type {
  UpdateLessonPayload,
  UpdateLessonResponse,
  DeleteLessonResponse,
} from '../types/lesson';

export const updateLesson = async (
  lessonId: string,
  payload: UpdateLessonPayload
): Promise<UpdateLessonResponse> => {
  const response = await apiClient.put<UpdateLessonResponse>(
    `/api/lessons/${lessonId}`,
    payload
  );
  return response.data;
};

export const deleteLesson = async (
  lessonId: string
): Promise<DeleteLessonResponse> => {
  const response = await apiClient.delete<DeleteLessonResponse>(
    `/api/lessons/${lessonId}`
  );
  return response.data;
};

export const teacherLessonsApi = {
  updateLesson,
  deleteLesson,
};

export default teacherLessonsApi;
