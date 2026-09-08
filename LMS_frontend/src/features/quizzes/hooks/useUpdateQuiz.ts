import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuiz } from '../api/teacherQuizzesApi';
import type { UpdateQuizPayload, TeacherQuiz } from '../types/quiz';
import { LESSON_QUIZZES_QUERY_KEY } from './useLessonQuizzes';
import { TEACHER_QUIZ_QUERY_KEY } from './useTeacherQuiz';

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
        queryKey: [...LESSON_QUIZZES_QUERY_KEY, variables.lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: [...TEACHER_QUIZ_QUERY_KEY, variables.lessonId, variables.quizId],
      });
    },
  });
};

export default useUpdateQuiz;
