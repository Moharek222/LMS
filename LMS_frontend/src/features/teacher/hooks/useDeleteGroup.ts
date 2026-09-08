import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroup } from '../api/teacherGroupsApi';
import type { DeleteGroupResponse } from '../types/groupManagement';
import { TEACHER_GROUPS_QUERY_KEY } from './useTeacherGroups';
import { GROUP_STUDENTS_QUERY_KEY } from './useGroupStudents';

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteGroupResponse['data'], Error, string>({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_GROUPS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...GROUP_STUDENTS_QUERY_KEY, groupId],
      });
    },
  });
};

export default useDeleteGroup;
