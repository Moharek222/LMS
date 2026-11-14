import apiClient from '../../../services/apiClient';
import type {
  Lesson,
  GetCourseLessonsResponse,
  LessonPdfData,
  GetLessonPdfResponse,
} from '../types/lesson';

export const getCourseLessons = async (courseId: string): Promise<Lesson[]> => {
  const response = await apiClient.get<GetCourseLessonsResponse>(
    `/api/lessons/${courseId}`,
    {
      params: { page: 1, limit: 100 },
    }
  );

  return response.data.data;
};

export const getLessonPdfPreview = async (
  lessonId: string
): Promise<LessonPdfData> => {
  const response = await apiClient.get<GetLessonPdfResponse>(
    `/api/lessons/${lessonId}/pdf`
  );
  return response.data.data;
};

export const lessonsApi = {
  getCourseLessons,
  getLessonPdfPreview,
};

export default lessonsApi;
