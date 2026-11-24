import axios from 'axios';
import apiClient from '../../../services/apiClient';
import type {
  ExamListItem,
  GetCourseExamsResponse,
  StudentExam,
  GetStudentExamResponse,
} from '../types/exam';
import type {
  SubmitExamPayload,
  ExamSubmissionResult,
  SubmitExamResponse,
} from '../types/examSubmission';

export const getCourseExams = async (courseId: string): Promise<ExamListItem[]> => {
  const response = await apiClient.get<GetCourseExamsResponse>(
    `/api/courses/${courseId}/exams`,
    {
      params: { page: 1, limit: 100 },
    }
  );
  return response.data.data;
};

export const getTeacherCourseExams = getCourseExams;

export const getStudentCourseExams = async (courseId: string): Promise<ExamListItem[]> => {
  const response = await apiClient.get<GetCourseExamsResponse>(
    `/api/courses/${courseId}/exams/student`
  );
  return response.data.data;
};

export const getStudentExam = async (
  courseId: string,
  examId: string
): Promise<StudentExam> => {
  const safeCourseId = courseId || 'course';
  const response = await apiClient.get<GetStudentExamResponse>(
    `/api/courses/${safeCourseId}/exams/${examId}/student`
  );
  return response.data.data;
};

export const submitExam = async (
  courseId: string,
  examId: string,
  payload: SubmitExamPayload
): Promise<ExamSubmissionResult> => {
  const safeCourseId = courseId || 'course';
  try {
    const response = await apiClient.post<SubmitExamResponse>(
      `/api/courses/${safeCourseId}/exams/${examId}/submissions`,
      payload
    );
    return response.data.data;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 409 ||
        error.message?.includes('409') ||
        error.message?.includes('already submitted'))
    ) {
      throw new Error(
        'تم تسليم هذا الامتحان سابقاً، ولا يمكن تسليمه أكثر من مرة.',
        { cause: error }
      );
    }
    throw error;
  }
};

export const examsApi = {
  getCourseExams,
  getStudentExam,
  submitExam,
};

export default examsApi;
