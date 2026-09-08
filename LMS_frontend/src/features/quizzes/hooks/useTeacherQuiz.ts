import { useQuery } from '@tanstack/react-query';
import { getTeacherQuiz } from '../api/teacherQuizzesApi';
import type { TeacherQuiz } from '../types/quiz';

export const TEACHER_QUIZ_QUERY_KEY = ['teacher-quiz'] as const;

export const useTeacherQuiz = (lessonId: string | undefined, quizId: string | undefined) => {
  return useQuery<TeacherQuiz, Error>({
    queryKey: [...TEACHER_QUIZ_QUERY_KEY, lessonId, quizId],
    queryFn: () => getTeacherQuiz(lessonId!, quizId!),
    enabled: Boolean(lessonId && quizId),
  });
};

export default useTeacherQuiz;
