import { useQuery } from '@tanstack/react-query';
import { getCourseLessons } from '../api/lessonsApi';
import { lessonQueryKeys } from '../constants/lessonQueryKeys';
import type { Lesson } from '../types/lesson';

export const COURSE_LESSONS_QUERY_KEY = ['course-lessons'] as const;

export const useCourseLessons = (courseId: string) => {
  return useQuery<Lesson[], Error>({
    queryKey: lessonQueryKeys.courseLessons(courseId),
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return getCourseLessons(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useCourseLessons;
