import { useQuery } from '@tanstack/react-query';
import { getTeacherExam } from '../api/teacherExamsApi';
import type { TeacherExam } from '../../exams/types/exam';
import { examQueryKeys } from '../../exams/constants/examQueryKeys';

export const useTeacherExam = (courseId?: string, examId?: string) => {
  return useQuery<TeacherExam, Error>({
    queryKey: examQueryKeys.teacherExam(courseId, examId),
    queryFn: () => getTeacherExam(courseId!, examId!),
    enabled: Boolean(courseId && examId),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export default useTeacherExam;
