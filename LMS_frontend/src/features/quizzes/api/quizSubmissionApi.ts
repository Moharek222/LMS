import apiClient from '../../../services/apiClient';

export interface SelectedAnswerPayload {
  QuestionId: string;
  selectedAnswer: string;
}

export interface SubmitQuizRequestPayload {
  selectedOption: SelectedAnswerPayload[];
}

export interface QuizSubmissionData {
  score: number;
  totalQuestions: number;
  isPassed: boolean;
  submission?: {
    _id: string;
    studentID: string;
    quizID: string;
    selectedOption: SelectedAnswerPayload[];
    score: number;
    isPassed: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface SubmitQuizResponse {
  message: string;
  data: QuizSubmissionData;
}

export const submitQuiz = async (
  lessonId: string,
  quizId: string,
  payload: SubmitQuizRequestPayload
): Promise<QuizSubmissionData> => {
  const url = `/api/lessons/${lessonId}/quizzes/${quizId}/submissions`;
  const response = await apiClient.post<SubmitQuizResponse>(url, payload);
  return response.data.data;
};

export const quizSubmissionApi = {
  submitQuiz,
};

export default quizSubmissionApi;
