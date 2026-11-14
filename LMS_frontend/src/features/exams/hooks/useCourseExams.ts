import { useQuery } from '@tanstack/react-query';
import { getCourseExams } from '../api/examsApi';
import { examQueryKeys } from '../constants/examQueryKeys';
import type { ExamListItem } from '../types/exam';

export const useCourseExams = (courseId?: string) => {
  return useQuery<ExamListItem[], Error>({
    queryKey: examQueryKeys.courseExams(courseId),
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return getCourseExams(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 2 * 60 * 1000,
  });
};

export default useCourseExams;
