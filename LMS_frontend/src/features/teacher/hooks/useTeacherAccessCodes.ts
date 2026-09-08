import { useQuery } from '@tanstack/react-query';
import { getTeacherAccessCodes, getStudentAccessCodes } from '../api/teacherAccessCodesApi';
import type { PaginatedAccessCodesResponse, AccessCodeQueryParams } from '../types/groupManagement';

export const TEACHER_ACCESS_CODES_QUERY_KEY = ['teacher-access-codes'] as const;
export const STUDENT_ACCESS_CODES_QUERY_KEY = ['student-access-codes'] as const;

export const useTeacherAccessCodes = (params?: AccessCodeQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<PaginatedAccessCodesResponse, Error>({
    queryKey: [...TEACHER_ACCESS_CODES_QUERY_KEY, page, limit],
    queryFn: () => getTeacherAccessCodes(params),
  });
};

export const useStudentAccessCodes = (studentId: string, params?: AccessCodeQueryParams) => {
  const page = params?.page;
  const limit = params?.limit;

  return useQuery<PaginatedAccessCodesResponse, Error>({
    queryKey: [...STUDENT_ACCESS_CODES_QUERY_KEY, studentId, page, limit],
    queryFn: () => getStudentAccessCodes(studentId, params),
    enabled: Boolean(studentId),
  });
};

export default useTeacherAccessCodes;
