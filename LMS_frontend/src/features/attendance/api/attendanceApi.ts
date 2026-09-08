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

export interface AttendanceSheetStudentDetails {
  _id: string;
  name: string;
  phone?: string;
}

export interface AttendanceSheetDetails {
  _id: string;
  groupID: string;
  date: string;
  presentStudents: AttendanceSheetStudentDetails[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSheetDetailsResponse {
  message: string;
  totalPresent: number;
  data: AttendanceSheetDetails;
}

export interface PaginatedAttendanceSheetsResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: AttendanceSheet[];
}

export interface RecordAttendanceResponse {
  message: string;
  data: AttendanceSheet;
}

export const getStudentAttendanceStats = async (
  groupId: string,
  studentId: string
): Promise<StudentAttendanceStats> => {
  const response = await apiClient.get<StudentAttendanceStatsResponse>(
    `/api/groups/${groupId}/attendance/student-percentage/${studentId}`
  );
  return response.data.data;
};

export const getMyAttendanceStats = async (
  groupId: string
): Promise<StudentAttendanceStats> => {
  const response = await apiClient.get<StudentAttendanceStatsResponse>(
    `/api/groups/${groupId}/attendance/my-percentage`
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

export const getAttendanceSheetDetails = async (
  groupId: string,
  attendanceId: string
): Promise<AttendanceSheetDetailsResponse> => {
  const response = await apiClient.get<AttendanceSheetDetailsResponse>(
    `/api/groups/${groupId}/attendance/sheet/${attendanceId}`
  );
  return response.data;
};

export const recordStudentAttendance = async (
  groupId: string,
  studentId: string
): Promise<AttendanceSheet> => {
  const response = await apiClient.post<RecordAttendanceResponse>(
    `/api/groups/${groupId}/attendance`,
    {
      studentID: studentId,
    }
  );
  return response.data.data;
};

export const attendanceApi = {
  getStudentAttendanceStats,
  getMyAttendanceStats,
  getGroupAttendanceSheets,
  getAttendanceSheetDetails,
  recordStudentAttendance,
};

export default attendanceApi;
