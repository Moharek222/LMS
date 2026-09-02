import { useMutation } from '@tanstack/react-query';
import { submitQuiz } from '../api/quizSubmissionApi';
import type { SubmitQuizRequestPayload, QuizSubmissionData } from '../api/quizSubmissionApi';

interface SubmitQuizVariables {
  lessonId: string;
  quizId: string;
  payload: SubmitQuizRequestPayload;
}

export const useSubmitQuiz = () => {
  return useMutation<QuizSubmissionData, Error, SubmitQuizVariables>({
    mutationFn: ({ lessonId, quizId, payload }) =>
      submitQuiz(lessonId, quizId, payload),
  });
};

export default useSubmitQuiz;
