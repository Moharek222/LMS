import { useQuery } from '@tanstack/react-query';
import { getCourseLessons } from '../api/lessonsApi';
import type { Lesson } from '../types/lesson';

export const COURSE_LESSONS_QUERY_KEY = ['course-lessons'] as const;

export const useCourseLessons = (courseId: string) => {
  return useQuery<Lesson[], Error>({
    queryKey: [...COURSE_LESSONS_QUERY_KEY, courseId],
    queryFn: () => getCourseLessons(courseId),
    enabled: Boolean(courseId),
  });
};

export default useCourseLessons;
