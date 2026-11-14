import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateStudent } from '../api/teacherGroupsApi';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useActivateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => activateStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.groupStudentsRoot() });
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.deactivatedStudentsRoot() });
    },
  });
};

export default useActivateStudent;
