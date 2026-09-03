import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLesson } from '../api/teacherApi';
import type { CreateLessonPayload } from '../api/teacherApi';
import type { Lesson } from '../../lessons/types/lesson';

interface CreateLessonVariables {
  courseId: string;
  payload: CreateLessonPayload;
}

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation<Lesson, Error, CreateLessonVariables>({
    mutationFn: ({ courseId, payload }) => createLesson(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
};

export default useCreateLesson;
