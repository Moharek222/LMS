import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuiz } from '../api/teacherApi';
import type { CreateQuizPayload } from '../api/teacherApi';
import type { QuizListItem } from '../../quizzes/types/quiz';
import { quizQueryKeys } from '../../quizzes/constants/quizQueryKeys';

interface CreateQuizVariables {
  lessonId: string;
  payload: CreateQuizPayload;
}

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation<QuizListItem, Error, CreateQuizVariables>({
    mutationFn: ({ lessonId, payload }) => createQuiz(lessonId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quizQueryKeys.lessonQuizzes(variables.lessonId) });
    },
  });
};

export default useCreateQuiz;
