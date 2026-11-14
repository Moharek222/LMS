import { useQuery } from '@tanstack/react-query';
import { getTeacherQuiz } from '../api/teacherQuizzesApi';
import { quizQueryKeys } from '../constants/quizQueryKeys';
import type { TeacherQuiz } from '../types/quiz';

export const TEACHER_QUIZ_QUERY_KEY = ['teacher-quiz'] as const;

export const useTeacherQuiz = (lessonId: string | undefined, quizId: string | undefined) => {
  return useQuery<TeacherQuiz, Error>({
    queryKey: quizQueryKeys.teacherQuiz(lessonId, quizId),
    queryFn: () => {
      if (!lessonId || !quizId) {
        throw new Error('Lesson ID and Quiz ID are required');
      }
      return getTeacherQuiz(lessonId, quizId);
    },
    enabled: Boolean(lessonId && quizId),
  });
};

export default useTeacherQuiz;
