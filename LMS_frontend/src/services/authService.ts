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
    groupId: credentials.groupId,
  };

  const response = await apiClient.post<StudentRegisterResponse>('/api/auth/register', payload);
  return response.data;
};

export const logoutApi = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>('/api/auth/logout');
  return response.data;
};

export const authService = {
  loginTeacher: loginTeacherApi,
  loginStudent: loginStudentApi,
  registerStudent: registerStudentApi,
  logout: logoutApi,
};

export default authService;
