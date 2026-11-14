import apiClient from '../../../services/apiClient';
import type {
  Course,
  CourseResponse,
  DeleteCourseResponse,
  StudentCoursesResponse,
} from '../types/course';

export const getStudentCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<StudentCoursesResponse>('/api/courses/student', {
    params: { page: 1, limit: 100 },
  });
  return response.data.data;
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await apiClient.get<CourseResponse>(`/api/courses/${courseId}`);
  return response.data.data;
};

export const deleteCourse = async (courseId: string): Promise<Course> => {
  const response = await apiClient.delete<DeleteCourseResponse>(`/api/courses/${courseId}`);
  return response.data.data;
};

export const coursesApi = {
  getStudentCourses,
  getCourseById,
  deleteCourse,
};

export default coursesApi;
