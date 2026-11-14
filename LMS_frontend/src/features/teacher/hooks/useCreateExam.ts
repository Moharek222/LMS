import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExam } from '../api/teacherExamsApi';
import type { CreateTeacherExamPayload, TeacherExam } from '../../exams/types/exam';
import { examQueryKeys } from '../../exams/constants/examQueryKeys';

export interface CreateExamVariables {
  courseId: string;
  payload: CreateTeacherExamPayload;
}

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherExam, Error, CreateExamVariables>({
    mutationFn: ({ courseId, payload }) => createExam(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.courseExams(variables.courseId) });
    },
  });
};

export default useCreateExam;
