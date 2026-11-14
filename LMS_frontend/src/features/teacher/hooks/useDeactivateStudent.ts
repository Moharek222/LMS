import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateStudent } from '../api/teacherGroupsApi';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useDeactivateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (studentId: string) => deactivateStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.groupStudentsRoot() });
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.deactivatedStudentsRoot() });
    },
  });
};

export default useDeactivateStudent;
