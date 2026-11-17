import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStudent } from '../api/teacherGroupsApi';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (studentId: string) => deleteStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.groupsRoot() });
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.groupStudentsRoot() });
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.deactivatedStudentsRoot() });
      queryClient.invalidateQueries({ queryKey: ['all-platform-students-for-group-modal'] });
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
    },
  });
};

export default useDeleteStudent;

