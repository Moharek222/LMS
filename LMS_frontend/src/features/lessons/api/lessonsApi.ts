import apiClient from '../../../services/apiClient';
import type { Lesson, GetCourseLessonsResponse } from '../types/lesson';

export const getCourseLessons = async (courseId: string): Promise<Lesson[]> => {
  const response = await apiClient.get<GetCourseLessonsResponse>('/api/lessons/', {
    params: { courseID: courseId },
  });
  return response.data.data;
};

export const lessonsApi = {
  getCourseLessons,
};

export default lessonsApi;
