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
  updateStudentProfile,
};
