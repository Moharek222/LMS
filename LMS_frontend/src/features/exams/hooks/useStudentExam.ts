import { useQuery } from '@tanstack/react-query';
import { getStudentExam } from '../api/examStudentApi';
import { examQueryKeys } from '../constants/examQueryKeys';
import type { StudentExam } from '../types/exam';

export const useStudentExam = (courseId?: string, examId?: string) => {
  return useQuery<StudentExam, Error>({
    queryKey: examQueryKeys.studentExam(courseId, examId),
    queryFn: () => {
      if (!courseId || !examId) {
        throw new Error('Course ID and Exam ID are required');
      }
      return getStudentExam(courseId, examId);
    },
    enabled: Boolean(courseId && examId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useStudentExam;
