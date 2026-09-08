import { useQuery } from '@tanstack/react-query';
import { getGroupStudents } from '../api/teacherGroupsApi';
import type { GroupStudent } from '../types/groupManagement';

export const GROUP_STUDENTS_QUERY_KEY = ['group-students'] as const;

export const useGroupStudents = (groupId: string) => {
  return useQuery<GroupStudent[], Error>({
    queryKey: [...GROUP_STUDENTS_QUERY_KEY, groupId],
    queryFn: () => getGroupStudents(groupId),
    enabled: Boolean(groupId),
  });
};

export default useGroupStudents;
