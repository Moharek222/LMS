import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLesson } from '../api/teacherLessonsApi';
import type { UpdateLessonPayload, UpdateLessonResponse } from '../types/lesson';
import { COURSE_LESSONS_QUERY_KEY } from './useCourseLessons';

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
        queryKey: [...COURSE_LESSONS_QUERY_KEY, courseId],
      });
    },
  });
};

export default useUpdateLesson;
