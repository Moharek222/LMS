import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateStudent } from '../api/teacherGroupsApi';
import { GROUP_STUDENTS_QUERY_KEY } from './useGroupStudents';

export const useDeactivateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (studentId: string) => deactivateStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_STUDENTS_QUERY_KEY });
    },
  });
};

export default useDeactivateStudent;
