import apiClient from '../../../services/apiClient';
import type { StudentExam, GetStudentExamResponse } from '../types/exam';

export const getStudentExam = async (
  courseId: string,
  examId: string
): Promise<StudentExam> => {
  const response = await apiClient.get<GetStudentExamResponse>(
    `/api/courses/${courseId}/exams/${examId}/student`
  );
  return response.data.data;
};

export const examStudentApi = {
  getStudentExam,
};

export default examStudentApi;
