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
  try {
    const response = await apiClient.post<SubmitExamResponse>(
      `/api/courses/${courseId}/exams/${examId}/submissions`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    if (
      error.response?.status === 409 ||
      error.message?.includes('409') ||
      error.message?.includes('already submitted')
    ) {
      throw new Error('تم تسليم هذا الامتحان سابقاً، ولا يمكن تسليمه أكثر من مرة.');
    }
    throw error;
  }
};

export const examSubmissionApi = {
  submitExam,
};

export default examSubmissionApi;
