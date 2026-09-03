import { useQuery } from '@tanstack/react-query';
import { getTeacherCourses } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';

export const useTeacherCourses = () => {
  return useQuery<Course[], Error>({
    queryKey: ['teacher-courses'],
    queryFn: getTeacherCourses,
  });
};

export default useTeacherCourses;
