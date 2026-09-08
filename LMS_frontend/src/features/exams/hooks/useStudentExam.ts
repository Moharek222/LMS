import { useQuery } from '@tanstack/react-query';
import { getStudentExam } from '../api/examStudentApi';
import type { StudentExam } from '../types/exam';

export const useStudentExam = (courseId?: string, examId?: string) => {
  return useQuery<StudentExam, Error>({
    queryKey: ['student-exam', courseId, examId],
    queryFn: () => getStudentExam(courseId!, examId!),
    enabled: Boolean(courseId && examId),
  });
};
