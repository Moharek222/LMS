import apiClient from '../../../services/apiClient';
import type {
  SubmitExamPayload,
  ExamSubmissionResult,
  SubmitExamResponse,
} from '../types/examSubmission';

export const submitExam = async (
  courseId: string,
  examId: string,
  payload: SubmitExamPayload
): Promise<ExamSubmissionResult> => {
  const response = await apiClient.post<SubmitExamResponse>(
    `/api/courses/${courseId}/exams/${examId}/submissions`,
    payload
  );
  return response.data.data;
};

export const examSubmissionApi = {
  submitExam,
};

export default examSubmissionApi;
