import { Grade } from './grade';
import { AcademicTrack } from './academicTrack';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  role: 'student' | 'teacher' | 'admin';
  groupId?: string;
  grade?: Grade;
  academicTrack?: AcademicTrack;
  isActive?: boolean;
  hasActiveSubscription?: boolean;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface TeacherLoginCredentials {
  email: string;
  password?: string;
}

export interface StudentLoginCredentials {
  phone: string;
  code?: string;
  password?: string;
}

export interface StudentRegisterCredentials {
  name: string;
  phone: string;
  parentPhone?: string;
  groupId?: string;
  grade: Grade;
  academicTrack?: AcademicTrack;
  password?: string;
}

export interface TeacherLoginResponse {
  message: string;
  token?: string;
  refreshToken?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'teacher' | 'admin';
    isActive: boolean;
  };
}

export interface StudentLoginResponse {
  message: string;
  token?: string;
  refreshToken?: string;
  data: {
    _id: string;
    name: string;
    phone: string;
    parentPhone?: string;
    groupID?: string;
    grade?: Grade;
    academicTrack?: AcademicTrack;
    hasActiveSubscription: boolean;
  };
}

export interface StudentRegisterResponse {
  message: string;
  student: {
    _id: string;
    name: string;
    phone: string;
    groupID?: string;
    grade?: Grade;
    academicTrack?: AcademicTrack;
  };
}

export interface LogoutResponse {
  message: string;
}
