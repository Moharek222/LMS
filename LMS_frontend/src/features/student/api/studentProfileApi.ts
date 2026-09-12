import apiClient from '../../../services/apiClient';

export interface UpdateStudentProfilePayload {
  name?: string;
  phone?: string;
  parentPhone?: string;
}

export interface UpdateStudentProfileResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    phone: string;
    parentPhone?: string;
    role: string;
  };
}

export interface StudentProfileData {
  _id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  role: string;
  groupID?: {
    _id: string;
    name: string;
  } | string;
  hasActiveSubscription?: boolean;
}

export const getMyStudentProfile = async (): Promise<StudentProfileData> => {
  const response = await apiClient.get<{ message: string; data: StudentProfileData }>('/api/students/me');
  return response.data.data;
};

export const updateStudentProfile = async (
  payload: UpdateStudentProfilePayload
): Promise<UpdateStudentProfileResponse['data']> => {
  const response = await apiClient.put<UpdateStudentProfileResponse>(
    '/api/students/profile',
    payload
  );
  return response.data.data;
};

export default {
  getMyStudentProfile,
  updateStudentProfile,
};

