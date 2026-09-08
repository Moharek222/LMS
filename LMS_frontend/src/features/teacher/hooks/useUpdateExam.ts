import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExam } from '../api/teacherExamsApi';
import type { UpdateTeacherExamPayload, TeacherExam } from '../../exams/types/exam';

export interface UpdateExamVariables {
  courseId: string;
  examId: string;
  payload: UpdateTeacherExamPayload;
}

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherExam, Error, UpdateExamVariables>({
    mutationFn: ({ courseId, examId, payload }) => updateExam(courseId, examId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-exams', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['student-exam', variables.courseId, variables.examId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-exam', variables.courseId, variables.examId] });
    },
  });
};

export default useUpdateExam;
