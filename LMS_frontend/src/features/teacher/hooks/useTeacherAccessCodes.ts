import { useQuery } from '@tanstack/react-query';
import { getTeacherAccessCodes, getStudentAccessCodes } from '../api/teacherAccessCodesApi';
import type { PaginatedAccessCodesResponse, AccessCodeQueryParams } from '../types/groupManagement';
import {
  teacherQueryKeys,
  TEACHER_ACCESS_CODES_QUERY_KEY,
  STUDENT_ACCESS_CODES_QUERY_KEY,
} from '../constants/teacherQueryKeys';

export { TEACHER_ACCESS_CODES_QUERY_KEY, STUDENT_ACCESS_CODES_QUERY_KEY };

export const useTeacherAccessCodes = (params?: AccessCodeQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<PaginatedAccessCodesResponse, Error>({
    queryKey: teacherQueryKeys.accessCodes(page, limit),
    queryFn: () => getTeacherAccessCodes(params),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
};

export const useStudentAccessCodes = (studentId: string, params?: AccessCodeQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<PaginatedAccessCodesResponse, Error>({
    queryKey: teacherQueryKeys.studentAccessCodes(studentId, page, limit),
    queryFn: () => getStudentAccessCodes(studentId, params),
    enabled: Boolean(studentId),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
};

export default useTeacherAccessCodes;
