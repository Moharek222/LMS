import { useQuery } from '@tanstack/react-query';
import { getGroupStudents } from '../api/teacherGroupsApi';
import type { GroupStudent } from '../types/groupManagement';
import { teacherQueryKeys, GROUP_STUDENTS_QUERY_KEY } from '../constants/teacherQueryKeys';

export { GROUP_STUDENTS_QUERY_KEY };

export const useGroupStudents = (groupId: string) => {
  return useQuery<GroupStudent[], Error>({
    queryKey: teacherQueryKeys.groupStudents(groupId),
    queryFn: () => getGroupStudents(groupId),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
};

export default useGroupStudents;
