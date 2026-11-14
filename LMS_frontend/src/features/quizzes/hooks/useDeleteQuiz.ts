import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteQuiz } from '../api/teacherQuizzesApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';
import type { DeleteQuizResponse } from '../types/quiz';

export interface DeleteQuizVariables {
  lessonId: string;
  quizId: string;
}

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteQuizResponse, Error, DeleteQuizVariables>({
    mutationFn: ({ lessonId, quizId }) => deleteQuiz(lessonId, quizId),
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

export default useDeleteQuiz;
