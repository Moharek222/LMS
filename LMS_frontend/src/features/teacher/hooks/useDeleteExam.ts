import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExam } from '../api/teacherExamsApi';
import type { TeacherExam } from '../../exams/types/exam';
import { examQueryKeys } from '../../exams/constants/examQueryKeys';

export interface DeleteExamVariables {
  courseId: string;
  examId: string;
}

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherExam, Error, DeleteExamVariables>({
    mutationFn: ({ courseId, examId }) => deleteExam(courseId, examId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.courseExams(variables.courseId) });
    },
  });
};

export default useDeleteExam;
