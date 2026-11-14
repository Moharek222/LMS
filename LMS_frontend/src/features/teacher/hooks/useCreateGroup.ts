import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '../api/teacherGroupsApi';
import type { Group, CreateGroupPayload } from '../types/groupManagement';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, CreateGroupPayload>({
    mutationFn: (payload) => createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.groupsRoot(),
      });
    },
  });
};

export default useCreateGroup;
