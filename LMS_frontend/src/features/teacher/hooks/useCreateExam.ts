import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExam } from '../api/teacherExamsApi';
import type { CreateTeacherExamPayload, TeacherExam } from '../../exams/types/exam';

export interface CreateExamVariables {
  courseId: string;
  payload: CreateTeacherExamPayload;
}

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherExam, Error, CreateExamVariables>({
    mutationFn: ({ courseId, payload }) => createExam(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-exams', variables.courseId] });
    },
  });
};

export default useCreateExam;
