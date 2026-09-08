import apiClient from '../../../services/apiClient';

export interface StudentAttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
}

export interface StudentAttendanceStatsResponse {
  message: string;
  data: StudentAttendanceStats;
}

export interface AttendanceSheet {
  _id: string;
  groupID: string;
  date: string;
  presentStudents: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedAttendanceSheetsResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: AttendanceSheet[];
}

export const getStudentAttendanceStats = async (
  groupId: string,
  studentId: string
): Promise<StudentAttendanceStats> => {
  const response = await apiClient.get<StudentAttendanceStatsResponse>(
    `/api/groups/${groupId}/attendance/student/${studentId}/percentage`
  );
  return response.data.data;
};

export const getGroupAttendanceSheets = async (
  groupId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedAttendanceSheetsResponse> => {
  const response = await apiClient.get<PaginatedAttendanceSheetsResponse>(
    `/api/groups/${groupId}/attendance/sheets`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

export const attendanceApi = {
  getStudentAttendanceStats,
  getGroupAttendanceSheets,
};

export default attendanceApi;
