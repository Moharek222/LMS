import apiClient from './apiClient';
import type {
  TeacherLoginCredentials,
  StudentLoginCredentials,
  StudentRegisterCredentials,
  TeacherLoginResponse,
  StudentLoginResponse,
  StudentRegisterResponse,
  LogoutResponse,
  UserProfile,
} from '../types/auth';



export const loginTeacherApi = async (credentials: TeacherLoginCredentials): Promise<UserProfile> => {
  const response = await apiClient.post<TeacherLoginResponse>('/api/auth/teacher-login', {
    email: credentials.email,
    password: credentials.password,
  });

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('lms_token', response.data.token);
  }
  if (response.data.refreshToken) {
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('lms_refresh_token', response.data.refreshToken);
  }

  const backendUser = response.data.user;

  return {
    id: backendUser._id,
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
    isActive: backendUser.isActive,
  };
};

export const loginStudentApi = async (credentials: StudentLoginCredentials): Promise<UserProfile> => {
  const response = await apiClient.post<StudentLoginResponse>('/api/auth/student-login', {
    phone: credentials.phone,
    password: credentials.password,
  });

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('lms_token', response.data.token);
  }
  if (response.data.refreshToken) {
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('lms_refresh_token', response.data.refreshToken);
  }

  const backendStudent = response.data.data;

  return {
    id: backendStudent._id,
    name: backendStudent.name,
    phone: backendStudent.phone,
    role: 'student',
    groupId: backendStudent.groupID,
    hasActiveSubscription: backendStudent.hasActiveSubscription,
  };
};

export const registerStudentApi = async (credentials: StudentRegisterCredentials): Promise<StudentRegisterResponse> => {
  
  const payload = {
    name: credentials.name,
    phone: credentials.phone,
    password: credentials.password,
    groupID: credentials.groupId,
  };

  const response = await apiClient.post<StudentRegisterResponse>('/api/auth/register', payload);
  return response.data;
};

export const refreshSessionApi = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('lms_refresh_token');
  if (!refreshToken) return null;

  try {
    let response: any = null;
    try {
      response = await apiClient.post<{ token?: string; accessToken?: string }>('/api/auth/refreshSession', {
        refreshToken,
      });
    } catch {
      response = await apiClient.post<{ token?: string; accessToken?: string }>('/api/auth/refresh', {
        refreshToken,
      });
    }

    const newToken = response?.data?.token || response?.data?.accessToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('lms_token', newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
};

export const logoutApi = async (): Promise<LogoutResponse> => {
  try {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout');
    return response.data;
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_refresh_token');
    localStorage.removeItem('lms_user');
  }
};

export const getMeApi = async (): Promise<UserProfile | null> => {
  const response = await apiClient.get<{ message: string; data?: any; user?: any }>('/api/students/me');
  const backendData = response.data?.data || response.data?.user;
  if (!backendData) return null;

  return {
    id: backendData._id || backendData.id,
    name: backendData.name,
    email: backendData.email,
    phone: backendData.phone,
    role: backendData.role || (backendData.email ? 'teacher' : 'student'),
    groupId: typeof backendData.groupID === 'object' ? backendData.groupID?._id : backendData.groupID,
    isActive: backendData.isActive !== false && backendData.isDeactivated !== true,
    hasActiveSubscription: backendData.hasActiveSubscription,
  };
};

export const authService = {
  loginTeacher: loginTeacherApi,
  loginStudent: loginStudentApi,
  registerStudent: registerStudentApi,
  getMe: getMeApi,
  logout: logoutApi,
};

export default authService;
