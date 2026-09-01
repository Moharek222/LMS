import { useQuery } from '@tanstack/react-query';
import { getStudentCourses } from '../api/coursesApi';
import type { Course } from '../types/course';

export const STUDENT_COURSES_QUERY_KEY = ['student-courses'] as const;

export const useStudentCourses = () => {
  return useQuery<Course[], Error>({
    queryKey: STUDENT_COURSES_QUERY_KEY,
    queryFn: getStudentCourses,
  });
};

export default useStudentCourses;
