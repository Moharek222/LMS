import apiClient from '../../../services/apiClient';

export interface MarkLessonWatchedPayload {
  courseID: string;
  lessonID: string;
}

export interface WatchedLessonItem {
  _id: string;
  title: string;
}

export interface CourseWatchHistoryItem {
  _id: string;
  studentID: string;
  courseID: {
    _id: string;
    title: string;
  } | string;
  watchedLessons: WatchedLessonItem[];
}

export interface StudentWatchHistoryResponse {
  message: string;
  data: CourseWatchHistoryItem[];
}

export const markLessonAsWatched = async (payload: MarkLessonWatchedPayload): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/api/progress', payload);
  return response.data;
};

export const getStudentWatchHistory = async (studentID: string): Promise<CourseWatchHistoryItem[]> => {
  const response = await apiClient.get<StudentWatchHistoryResponse>(`/api/progress/watch-history/${studentID}`);
  return response.data.data || [];
};

export const progressApi = {
  markLessonAsWatched,
  getStudentWatchHistory,
};

export default progressApi;
