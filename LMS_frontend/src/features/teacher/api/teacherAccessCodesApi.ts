import apiClient from '../../../services/apiClient';
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

export const getAllStudentsApi = async (): Promise<Array<{ _id: string; name: string; phone: string; groupID?: any }>> => {
  try {
    const response = await apiClient.get<any>('/api/students', {
      params: { page: 1, limit: 1000 },
    });
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data?.students)) {
      return response.data.students;
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

