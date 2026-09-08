import apiClient from '../../../services/apiClient';

export interface CreateStaffPayload {
  name: string;
  email: string;
  password?: string;
}

export interface CreateStaffResponse {
  message: string;
  teacher?: any;
  admin?: any;
}

export const addTeacher = async (payload: CreateStaffPayload): Promise<CreateStaffResponse> => {
  const response = await apiClient.post<CreateStaffResponse>('/api/users/teacher', payload);
  return response.data;
};

export const addAdmin = async (payload: CreateStaffPayload): Promise<CreateStaffResponse> => {
  const response = await apiClient.post<CreateStaffResponse>('/api/users/admin', payload);
  return response.data;
};

export const deleteAdminUser = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/api/users/${id}`);
  return response.data;
};

export default {
  addTeacher,
  addAdmin,
  deleteAdminUser,
};
