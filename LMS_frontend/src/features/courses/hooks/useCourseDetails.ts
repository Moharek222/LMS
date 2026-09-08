import { useQuery } from '@tanstack/react-query';
import { getCourseById } from '../api/teacherCoursesApi';
import type { Course } from '../types/course';

export const useCourseDetails = (courseId?: string) => {
  return useQuery<Course, Error>({
    queryKey: ['course-details', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: Boolean(courseId),
  });
};

export default useCourseDetails;
