import { useQuery } from '@tanstack/react-query';
import { getDeactivatedStudentsApi } from '../api/teacherGroupsApi';
import type { PaginatedDeactivatedStudentsResponse, BaseQueryParams } from '../types/groupManagement';
import { teacherQueryKeys, DEACTIVATED_STUDENTS_QUERY_KEY } from '../constants/teacherQueryKeys';

export { DEACTIVATED_STUDENTS_QUERY_KEY };

export const useDeactivatedStudents = (params?: BaseQueryParams) => {
  const page = params?.page || 1;
  const limit = params?.limit || 50;

  return useQuery<PaginatedDeactivatedStudentsResponse, Error>({
    queryKey: teacherQueryKeys.deactivatedStudents(page, limit),
    queryFn: () => getDeactivatedStudentsApi({ page, limit }),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
};

export default useDeactivatedStudents;
