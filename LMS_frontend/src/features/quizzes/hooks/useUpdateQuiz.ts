import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuiz } from '../api/teacherQuizzesApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';
import type { UpdateQuizPayload, TeacherQuiz } from '../types/quiz';

export interface UpdateQuizVariables {
  lessonId: string;
  quizId: string;
  payload: UpdateQuizPayload;
}

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherQuiz, Error, UpdateQuizVariables>({
    mutationFn: ({ lessonId, quizId, payload }) => updateQuiz(lessonId, quizId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizQueryKeys.lessonQuizzes(variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: quizQueryKeys.teacherQuiz(variables.lessonId, variables.quizId),
      });
    },
  });
};

export default useUpdateQuiz;
