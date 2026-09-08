import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudentAttendanceStats,
  getMyAttendanceStats,
  getGroupAttendanceSheets,
  getAttendanceSheetDetails,
  recordStudentAttendance,
  type StudentAttendanceStats,
  type PaginatedAttendanceSheetsResponse,
  type AttendanceSheetDetailsResponse,
  type AttendanceSheet,
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

export const useMyAttendanceStats = (groupId?: string) => {
  return useQuery<StudentAttendanceStats, Error>({
    queryKey: ['attendance', 'my-stats', groupId],
    queryFn: () => getMyAttendanceStats(groupId!),
    enabled: Boolean(groupId),
  });
};

export const useGroupAttendanceSheets = (
  groupId?: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<PaginatedAttendanceSheetsResponse, Error>({
    queryKey: ['group-attendance-sheets', groupId, page, limit],
    queryFn: () => getGroupAttendanceSheets(groupId!, page, limit),
    enabled: Boolean(groupId),
  });
};

export const useAttendanceSheetDetails = (
  groupId?: string,
  attendanceId?: string
) => {
  return useQuery<AttendanceSheetDetailsResponse, Error>({
    queryKey: ['attendance-sheet-details', groupId, attendanceId],
    queryFn: () => getAttendanceSheetDetails(groupId!, attendanceId!),
    enabled: Boolean(groupId && attendanceId),
  });
};

export interface RecordAttendanceVariables {
  groupId: string;
  studentId: string;
}

export const useRecordStudentAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<AttendanceSheet, Error, RecordAttendanceVariables>({
    mutationFn: ({ groupId, studentId }) =>
      recordStudentAttendance(groupId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['group-attendance-sheets', variables.groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance-sheet-details', variables.groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'stats', variables.groupId],
      });
    },
  });
};
