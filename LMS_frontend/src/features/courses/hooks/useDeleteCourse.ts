import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCourse } from '../api/coursesApi';
import { courseQueryKeys } from '../constants/courseQueryKeys';
import type { Course } from '../types/course';

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, string>({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacher() });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.student() });
    },
  });
};

export default useDeleteCourse;
