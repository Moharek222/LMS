import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroup } from '../api/teacherGroupsApi';
import type { DeleteGroupResponse } from '../types/groupManagement';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteGroupResponse['data'], Error, string>({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.groupsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.groupStudents(groupId),
      });
    },
  });
};

export default useDeleteGroup;
