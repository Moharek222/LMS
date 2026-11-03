import apiClient from '../../../services/apiClient';

export interface VerifyAccessCodePayload {
  code: string;
}

export interface VerifyAccessCodeResponse {
  message: string;
  data?: {
    expiresAt?: string;
    status?: string;
  };
}

export const verifyAccessCode = async (code: string): Promise<VerifyAccessCodeResponse> => {
  const response = await apiClient.post<VerifyAccessCodeResponse>('/api/access-codes/verify', {
    code,
  });
  return response.data;
};

export default {
  verifyAccessCode,
};
