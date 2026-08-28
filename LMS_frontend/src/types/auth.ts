export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
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
