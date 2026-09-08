import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '../api/teacherGroupsApi';
import type { Group, CreateGroupPayload } from '../types/groupManagement';
import { TEACHER_GROUPS_QUERY_KEY } from './useTeacherGroups';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, CreateGroupPayload>({
    mutationFn: (payload) => createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_GROUPS_QUERY_KEY,
      });
    },
  });
};

export default useCreateGroup;
