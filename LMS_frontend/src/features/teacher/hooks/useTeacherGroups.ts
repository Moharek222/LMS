import { useQuery } from '@tanstack/react-query';
import { getTeacherGroups } from '../api/teacherGroupsApi';
import type { PaginatedGroupsResponse, GroupQueryParams } from '../types/groupManagement';

export const TEACHER_GROUPS_QUERY_KEY = ['teacher-groups'] as const;

export const useTeacherGroups = (params?: GroupQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<PaginatedGroupsResponse, Error>({
    queryKey: [...TEACHER_GROUPS_QUERY_KEY, page, limit],
    queryFn: () => getTeacherGroups(params),
  });
};

export default useTeacherGroups;
