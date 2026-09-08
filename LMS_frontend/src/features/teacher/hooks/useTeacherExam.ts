import { useQuery } from '@tanstack/react-query';
import { getTeacherExam } from '../api/teacherExamsApi';
import type { TeacherExam } from '../../exams/types/exam';

export const useTeacherExam = (courseId?: string, examId?: string) => {
  return useQuery<TeacherExam, Error>({
    queryKey: ['teacher-exam', courseId, examId],
    queryFn: () => getTeacherExam(courseId!, examId!),
    enabled: Boolean(courseId && examId),
  });
};

export default useTeacherExam;
