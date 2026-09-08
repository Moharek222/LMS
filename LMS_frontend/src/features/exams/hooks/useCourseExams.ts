import { useQuery } from '@tanstack/react-query';
import { getCourseExams } from '../api/examsApi';
import type { ExamListItem } from '../types/exam';

export const useCourseExams = (courseId?: string) => {
  return useQuery<ExamListItem[], Error>({
    queryKey: ['course-exams', courseId],
    queryFn: () => getCourseExams(courseId!),
    enabled: Boolean(courseId),
  });
};
