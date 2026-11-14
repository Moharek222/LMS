import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLesson } from '../api/teacherApi';
import type { CreateLessonPayload } from '../api/teacherApi';
import type { Lesson } from '../../lessons/types/lesson';
import { lessonQueryKeys } from '../../lessons/constants/lessonQueryKeys';
import { courseQueryKeys } from '../../courses/constants/courseQueryKeys';

interface CreateLessonVariables {
  courseId: string;
  payload: CreateLessonPayload;
}

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation<Lesson, Error, CreateLessonVariables>({
    mutationFn: ({ courseId, payload }) => createLesson(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.courseLessons(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacher() });
    },
  });
};

export default useCreateLesson;
