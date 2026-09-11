import apiClient from '../../../services/apiClient';
import type {
  TeacherExam,
  GetTeacherExamResponse,
  CreateTeacherExamPayload,
  UpdateTeacherExamPayload,
  TeacherExamMutationResponse,
} from '../../exams/types/exam';

export const getTeacherExam = async (
  courseId: string,
  examId: string
): Promise<TeacherExam> => {
  const response = await apiClient.get<GetTeacherExamResponse>(
    `/api/courses/${courseId}/exams/${examId}/teacher`
  );
  return response.data.data;
};

export const createExam = async (
  courseId: string,
  payload: CreateTeacherExamPayload
): Promise<TeacherExam> => {
  const response = await apiClient.post<TeacherExamMutationResponse>(
    `/api/courses/${courseId}/exams`,
    payload
  );
  return response.data.data;
};

export const updateExam = async (
  courseId: string,
  examId: string,
  payload: UpdateTeacherExamPayload
): Promise<TeacherExam> => {
  const response = await apiClient.put<TeacherExamMutationResponse>(
    `/api/courses/${courseId}/exams/${examId}`,
    payload
  );
  return response.data.data;
};

export const deleteExam = async (
  courseId: string,
  examId: string
): Promise<TeacherExam> => {
  const response = await apiClient.delete<TeacherExamMutationResponse>(
    `/api/courses/${courseId}/exams/${examId}`
  );
  return response.data.data;
};

export const uploadExamQuestionImage = async (
  courseId: string,
  file: File
): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<{ message: string; data: { imageUrl: string } }>(
    `/api/courses/${courseId}/exams/upload-image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

export const teacherExamsApi = {
  getTeacherExam,
  createExam,
  updateExam,
  deleteExam,
  uploadExamQuestionImage,
};

export default teacherExamsApi;
