import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitQuiz } from '../api/quizSubmissionApi';
import type { SubmitQuizRequestPayload, QuizSubmissionData } from '../api/quizSubmissionApi';
import { STUDENT_QUIZ_HISTORY_QUERY_KEY } from '../../student/hooks/useStudentQuizHistory';

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
        queryKey: STUDENT_QUIZ_HISTORY_QUERY_KEY,
      });
    },
  });
};

export default useSubmitQuiz;
