import { useQuery } from '@tanstack/react-query';
import { getCourseById } from '../api/coursesApi';
import { courseQueryKeys } from '../constants/courseQueryKeys';
import type { Course } from '../types/course';

export const useCourseDetails = (courseId?: string) => {
  return useQuery<Course, Error>({
    queryKey: courseQueryKeys.details(courseId),
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return getCourseById(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useCourseDetails;
