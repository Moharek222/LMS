import { useQuery } from '@tanstack/react-query';
import {
  getStudentAttendanceStats,
  getGroupAttendanceSheets,
  type StudentAttendanceStats,
  type PaginatedAttendanceSheetsResponse,
} from '../api/attendanceApi';

export const useStudentAttendanceStats = (
  groupId?: string,
  studentId?: string
) => {
  return useQuery<StudentAttendanceStats, Error>({
    queryKey: ['attendance', 'stats', groupId, studentId],
    queryFn: () => getStudentAttendanceStats(groupId!, studentId!),
    enabled: Boolean(groupId && studentId),
  });
};

export const useGroupAttendanceSheets = (
  groupId?: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<PaginatedAttendanceSheetsResponse, Error>({
    queryKey: ['attendance', 'sheets', groupId, page, limit],
    queryFn: () => getGroupAttendanceSheets(groupId!, page, limit),
    enabled: Boolean(groupId),
  });
};
