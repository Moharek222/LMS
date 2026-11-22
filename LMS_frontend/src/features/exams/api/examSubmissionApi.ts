import apiClient from '../../../services/apiClient';
import { submitExam } from './examsApi';
import type {
  StudentExamResultData,
  StudentExamResultResponse,
} from '../types/examSubmission';

export { submitExam };

export const getStudentExamSubmissionResult = async (
  courseId: string,
  examId: string,
  submissionId: string
): Promise<StudentExamResultData> => {
  const safeCourseId = courseId || 'course';
  const safeExamId = examId || 'exam';
  const response = await apiClient.get<StudentExamResultResponse>(
    `/api/courses/${safeCourseId}/exams/${safeExamId}/submissions/${submissionId}/result`
  );
  return response.data.data;
};

export const examSubmissionApi = {
  submitExam,
  getStudentExamSubmissionResult,
};

export default examSubmissionApi;
