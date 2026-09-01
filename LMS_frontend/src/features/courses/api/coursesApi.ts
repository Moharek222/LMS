import apiClient from '../../../services/apiClient';
import type { Course, StudentCoursesResponse } from '../types/course';

export const getStudentCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<StudentCoursesResponse>('/api/courses/student');
  return response.data.data;
};

export const coursesApi = {
  getStudentCourses,
};

export default coursesApi;
