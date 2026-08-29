export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  groupId?: string;
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
  groupId: string;
  password?: string;
}

export interface TeacherLoginResponse {
  message: string;
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
  data: {
    _id: string;
    name: string;
    phone: string;
    groupID: string;
    hasActiveSubscription: boolean;
  };
}

export interface StudentRegisterResponse {
  message: string;
  student: {
    _id: string;
    name: string;
    phone: string;
    groupID: string;
  };
}

export interface LogoutResponse {
  message: string;
}
