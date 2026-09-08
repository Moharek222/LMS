import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLesson } from '../api/teacherLessonsApi';
import type { DeleteLessonResponse } from '../types/lesson';
import { COURSE_LESSONS_QUERY_KEY } from './useCourseLessons';

export interface DeleteLessonVariables {
  lessonId: string;
}

export const useDeleteLesson = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteLessonResponse, Error, DeleteLessonVariables>({
    mutationFn: ({ lessonId }) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...COURSE_LESSONS_QUERY_KEY, courseId],
      });
    },
  });
};

export default useDeleteLesson;
