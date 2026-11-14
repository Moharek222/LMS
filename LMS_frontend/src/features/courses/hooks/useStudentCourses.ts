import { useQuery } from '@tanstack/react-query';
import { getStudentCourses } from '../api/coursesApi';
import { courseQueryKeys } from '../constants/courseQueryKeys';
import type { Course } from '../types/course';

export const STUDENT_COURSES_QUERY_KEY = courseQueryKeys.student();

export const useStudentCourses = () => {
  return useQuery<Course[], Error>({
    queryKey: courseQueryKeys.student(),
    queryFn: getStudentCourses,
    staleTime: 5 * 60 * 1000,
  });
};

export default useStudentCourses;
