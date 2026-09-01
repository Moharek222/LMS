import apiClient from '../../../services/apiClient';
import type { GetLessonVideoResponse, LessonVideoData } from '../types/lesson';

export const getLessonVideo = async (lessonId: string): Promise<LessonVideoData> => {
  const response = await apiClient.get<GetLessonVideoResponse>(`/api/lessons/${lessonId}/video`);
  return response.data.data;
};

export const lessonVideoApi = {
  getLessonVideo,
};

export default lessonVideoApi;
