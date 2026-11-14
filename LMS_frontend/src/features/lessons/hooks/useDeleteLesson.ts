import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLesson } from '../api/teacherLessonsApi';
import { lessonQueryKeys } from '../constants/lessonQueryKeys';
import type { DeleteLessonResponse } from '../types/lesson';

export interface DeleteLessonVariables {
  lessonId: string;
}

export const useDeleteLesson = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteLessonResponse, Error, DeleteLessonVariables>({
    mutationFn: ({ lessonId }) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lessonQueryKeys.courseLessons(courseId),
      });
    },
  });
};

export default useDeleteLesson;
