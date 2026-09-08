import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCourse } from '../api/teacherCoursesApi';
import type { Course } from '../types/course';

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, string>({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
};

export default useDeleteCourse;
