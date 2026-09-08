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

export const teacherExamsApi = {
  getTeacherExam,
  createExam,
  updateExam,
  deleteExam,
};

export default teacherExamsApi;
