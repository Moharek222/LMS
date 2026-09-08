import { useQuery } from '@tanstack/react-query';
import { getExamStatistics } from '../api/teacherExamSubmissionsApi';
import type { ExamStatisticsData } from '../api/teacherExamSubmissionsApi';

export const EXAM_STATISTICS_QUERY_KEY = 'examStatistics';

export const useExamStatistics = (
  courseId?: string,
  examId?: string
) => {
  return useQuery<ExamStatisticsData, Error>({
    queryKey: [EXAM_STATISTICS_QUERY_KEY, courseId, examId],
    queryFn: () => getExamStatistics(courseId!, examId!),
    enabled: Boolean(courseId && examId),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};

export default useExamStatistics;
