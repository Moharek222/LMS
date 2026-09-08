import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from '../api/teacherGroupsApi';
import type { Group, UpdateGroupPayload } from '../types/groupManagement';
import { TEACHER_GROUPS_QUERY_KEY } from './useTeacherGroups';

export interface UpdateGroupVariables {
  groupId: string;
  payload: UpdateGroupPayload;
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, UpdateGroupVariables>({
    mutationFn: ({ groupId, payload }) => updateGroup(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_GROUPS_QUERY_KEY,
      });
    },
  });
};

export default useUpdateGroup;
