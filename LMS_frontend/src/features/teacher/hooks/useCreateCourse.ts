import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse } from '../api/teacherApi';
import type { CreateCoursePayload } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';
import { courseQueryKeys } from '../../courses/constants/courseQueryKeys';

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, CreateCoursePayload>({
    mutationFn: (payload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacher() });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.student() });
    },
  });
};

export default useCreateCourse;
