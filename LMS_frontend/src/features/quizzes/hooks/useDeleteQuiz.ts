import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteQuiz } from '../api/teacherQuizzesApi';
import type { DeleteQuizResponse } from '../types/quiz';
import { LESSON_QUIZZES_QUERY_KEY } from './useLessonQuizzes';

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
        queryKey: [...LESSON_QUIZZES_QUERY_KEY, variables.lessonId],
      });
    },
  });
};

export default useDeleteQuiz;
