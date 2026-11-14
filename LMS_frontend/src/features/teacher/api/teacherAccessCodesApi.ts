import apiClient from '../../../services/apiClient';
import type { Grade } from '../../../types/grade';
import type { AcademicTrack } from '../../../types/academicTrack';
import type {
  PaginatedAccessCodesResponse,
  GenerateAccessCodeResponse,
  GeneratedAccessCodeResult,
  GenerateAccessCodePayload,
  GenerateGroupAccessCodesPayload,
  GenerateGroupAccessCodesResponse,
  GenerateGroupAccessCodesResult,
  AccessCodeQueryParams,
} from '../types/groupManagement';

export const getTeacherAccessCodes = async (
  params?: AccessCodeQueryParams
): Promise<PaginatedAccessCodesResponse> => {
  const response = await apiClient.get<PaginatedAccessCodesResponse>('/api/access-codes/', {
    params,
  });
  return response.data;
};

export const getStudentAccessCodes = async (
  studentId: string,
  params?: AccessCodeQueryParams
): Promise<PaginatedAccessCodesResponse> => {
  const response = await apiClient.get<PaginatedAccessCodesResponse>(
    `/api/access-codes/student/${studentId}`,
    { params }
  );
  return response.data;
};

export const generateAccessCode = async (
  payload: GenerateAccessCodePayload
): Promise<GeneratedAccessCodeResult> => {
  const response = await apiClient.post<GenerateAccessCodeResponse>(
    '/api/access-codes/generate',
    payload
  );
  return response.data.data;
};

export const generateGroupAccessCodes = async (
  payload: GenerateGroupAccessCodesPayload
): Promise<GenerateGroupAccessCodesResult> => {
  const response = await apiClient.post<GenerateGroupAccessCodesResponse>(
    '/api/access-codes/generate-group-codes',
    payload
  );
  return response.data.data;
};

export interface PlatformStudentItem {
  _id: string;
  name: string;
  phone: string;
  grade?: Grade | string;
  academicTrack?: AcademicTrack | string;
  groupID?: { _id: string; name: string } | string;
}

export const getAllStudentsApi = async (): Promise<PlatformStudentItem[]> => {
  try {
    const response = await apiClient.get<{ data?: PlatformStudentItem[]; students?: PlatformStudentItem[] } | PlatformStudentItem[]>('/api/students', {
      params: { page: 1, limit: 1000 },
    });
    const resData = response.data;
    if (Array.isArray(resData)) {
      return resData;
    }
    if (resData && 'data' in resData && Array.isArray(resData.data)) {
      return resData.data;
    }
    if (resData && 'students' in resData && Array.isArray(resData.students)) {
      return resData.students;
    }
    return [];
  } catch (err) {
    console.error('getAllStudentsApi failed:', err);
    return [];
  }
};

export const teacherAccessCodesApi = {
  getTeacherAccessCodes,
  getStudentAccessCodes,
  generateAccessCode,
  generateGroupAccessCodes,
  getAllStudentsApi,
};

export default teacherAccessCodesApi;

