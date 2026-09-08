import apiClient from '../../../services/apiClient';
import type { ExamListItem, GetCourseExamsResponse } from '../types/exam';

export const getCourseExams = async (courseId: string): Promise<ExamListItem[]> => {
  const response = await apiClient.get<GetCourseExamsResponse>(
    `/api/courses/${courseId}/exams`
  );
  return response.data.data;
};

export const examsApi = {
  getCourseExams,
};

export default examsApi;
