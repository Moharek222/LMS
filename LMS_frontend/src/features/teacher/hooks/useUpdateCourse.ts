import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCourse } from '../api/teacherApi';
import type { UpdateCoursePayload } from '../api/teacherApi';
import type { Course } from '../../courses/types/course';

export interface UpdateCourseVariables {
  courseId: string;
  payload: UpdateCoursePayload;
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, UpdateCourseVariables>({
    mutationFn: ({ courseId, payload }) => updateCourse(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
};

export default useUpdateCourse;
