import apiClient from '../../../services/apiClient';

export interface CreateStaffPayload {
  name: string;
  email: string;
  password?: string;
}

export interface CreateStaffResponse {
  message: string;
  teacher?: AdminUserItem;
  admin?: AdminUserItem;
  adminWithoutPassword?: AdminUserItem;
}

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAdminsResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: AdminUserItem[];
}

export const getAdmins = async (page: number = 1, limit: number = 50): Promise<GetAdminsResponse> => {
  try {
    const response = await apiClient.get<GetAdminsResponse>('/api/users/admins', {
      params: { page, limit },
    });
    return response.data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return {
        message: 'Endpoint not mapped yet',
        page,
        limit,
        total: 0,
        totalPages: 0,
        data: [],
      };
    }
    throw err;
  }
};

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
  getAdmins,
  addTeacher,
  addAdmin,
  deleteAdminUser,
};
