import apiClient from '../../../services/apiClient';
import type { Course, CourseResponse, DeleteCourseResponse } from '../types/course';

export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await apiClient.get<CourseResponse>(`/api/courses/${courseId}`);
  return response.data.data;
};

export const deleteCourse = async (courseId: string): Promise<Course> => {
  const response = await apiClient.delete<DeleteCourseResponse>(`/api/courses/${courseId}`);
  return response.data.data;
};

export const teacherCoursesApi = {
  getCourseById,
  deleteCourse,
};

export default teacherCoursesApi;
