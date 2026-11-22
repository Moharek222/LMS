import { useQuery } from '@tanstack/react-query';
import { getStudentExamSubmissionResult } from '../api/examSubmissionApi';
import { examQueryKeys } from '../constants/examQueryKeys';
import type { StudentExamResultData } from '../types/examSubmission';

export const useStudentExamResult = (
  courseId?: string,
  examId?: string,
  submissionId?: string,
  enabled: boolean = true
) => {
  return useQuery<StudentExamResultData, Error>({
    queryKey: examQueryKeys.studentSubmissionResult(courseId, examId, submissionId),
    queryFn: () => getStudentExamSubmissionResult(courseId || 'course', examId || 'exam', submissionId!),
    enabled: Boolean(enabled && submissionId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useStudentExamResult;

