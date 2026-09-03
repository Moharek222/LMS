import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse } from '../api/teacherApi';
import type { CreateCoursePayload } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, CreateCoursePayload>({
    mutationFn: (payload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
};

export default useCreateCourse;
