import { useQuery } from '@tanstack/react-query';
import { getDeactivatedStudentsApi } from '../api/teacherGroupsApi';
import type { PaginatedDeactivatedStudentsResponse, BaseQueryParams } from '../types/groupManagement';

export const DEACTIVATED_STUDENTS_QUERY_KEY = ['deactivated-students'] as const;

export const useDeactivatedStudents = (params?: BaseQueryParams) => {
  const page = params?.page || 1;
  const limit = params?.limit || 50;

  return useQuery<PaginatedDeactivatedStudentsResponse, Error>({
    queryKey: [...DEACTIVATED_STUDENTS_QUERY_KEY, page, limit],
    queryFn: () => getDeactivatedStudentsApi({ page, limit }),
  });
};

export default useDeactivatedStudents;
