import { useQuery } from '@tanstack/react-query';
import { getTeacherCourses } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';

export const useTeacherCourses = () => {
  return useQuery<Course[], Error>({
    queryKey: ['teacher-courses'],
    queryFn: getTeacherCourses,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export default useTeacherCourses;
