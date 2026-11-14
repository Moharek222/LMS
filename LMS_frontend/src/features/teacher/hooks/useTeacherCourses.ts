import { useQuery } from '@tanstack/react-query';
import { getTeacherCourses } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';
import { courseQueryKeys } from '../../courses/constants/courseQueryKeys';

export const useTeacherCourses = () => {
  return useQuery<Course[], Error>({
    queryKey: courseQueryKeys.teacher(),
    queryFn: getTeacherCourses,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export default useTeacherCourses;
