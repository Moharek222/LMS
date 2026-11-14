import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCourse } from '../api/teacherApi';
import type { UpdateCoursePayload } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';
import { courseQueryKeys } from '../../courses/constants/courseQueryKeys';

export interface UpdateCourseVariables {
  courseId: string;
  payload: UpdateCoursePayload;
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, UpdateCourseVariables>({
    mutationFn: ({ courseId, payload }) => updateCourse(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.teacher() });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.student() });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: courseQueryKeys.details(variables.courseId) });
      }
    },
  });
};

export default useUpdateCourse;
