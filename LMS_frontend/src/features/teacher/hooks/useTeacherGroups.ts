import { useQuery } from '@tanstack/react-query';
import { getTeacherGroups } from '../api/teacherGroupsApi';
import type { PaginatedGroupsResponse, GroupQueryParams } from '../types/groupManagement';
import { teacherQueryKeys, TEACHER_GROUPS_QUERY_KEY } from '../constants/teacherQueryKeys';

export { TEACHER_GROUPS_QUERY_KEY };

export const useTeacherGroups = (params?: GroupQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<PaginatedGroupsResponse, Error>({
    queryKey: teacherQueryKeys.groupsList(page, limit),
    queryFn: () => getTeacherGroups(params),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export default useTeacherGroups;
