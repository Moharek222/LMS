import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLesson } from '../api/teacherLessonsApi';
import { lessonQueryKeys } from '../constants/lessonQueryKeys';
import type { UpdateLessonPayload, UpdateLessonResponse } from '../types/lesson';

export interface UpdateLessonVariables {
  lessonId: string;
  payload: UpdateLessonPayload;
}

export const useUpdateLesson = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateLessonResponse, Error, UpdateLessonVariables>({
    mutationFn: ({ lessonId, payload }) => updateLesson(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lessonQueryKeys.courseLessons(courseId),
      });
    },
  });
};

export default useUpdateLesson;
