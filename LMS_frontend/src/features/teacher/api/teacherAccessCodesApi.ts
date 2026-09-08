import apiClient from '../../../services/apiClient';
import type {
  PaginatedAccessCodesResponse,
  GenerateAccessCodeResponse,
  GeneratedAccessCodeResult,
  GenerateAccessCodePayload,
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

export const teacherAccessCodesApi = {
  getTeacherAccessCodes,
  getStudentAccessCodes,
  generateAccessCode,
};

export default teacherAccessCodesApi;
