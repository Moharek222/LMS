import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitQuiz } from '../api/quizSubmissionApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';
import type { SubmitQuizRequestPayload, QuizSubmissionData } from '../api/quizSubmissionApi';

interface SubmitQuizVariables {
  lessonId: string;
  quizId: string;
  payload: SubmitQuizRequestPayload;
}

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation<QuizSubmissionData, Error, SubmitQuizVariables>({
    mutationFn: ({ lessonId, quizId, payload }) =>
      submitQuiz(lessonId, quizId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizQueryKeys.studentHistory(),
      });
    },
  });
};

export default useSubmitQuiz;
