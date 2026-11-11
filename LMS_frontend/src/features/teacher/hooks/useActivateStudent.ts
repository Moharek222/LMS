import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateStudent } from '../api/teacherGroupsApi';
import { GROUP_STUDENTS_QUERY_KEY } from './useGroupStudents';
import { DEACTIVATED_STUDENTS_QUERY_KEY } from './useDeactivatedStudents';

export const useActivateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => activateStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_STUDENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DEACTIVATED_STUDENTS_QUERY_KEY });
    },
  });
};

export default useActivateStudent;
