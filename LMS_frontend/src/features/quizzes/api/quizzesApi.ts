import apiClient from '../../../services/apiClient';
import type {
  GetLessonQuizzesResponse,
  GetStudentQuizResponse,
  QuizListItem,
  StudentQuiz,
} from '../types/quiz';

export const getLessonQuizzes = async (lessonId: string): Promise<QuizListItem[]> => {
  const response = await apiClient.get<GetLessonQuizzesResponse>(
    `/api/lessons/${lessonId}/quizzes`
  );
  return response.data.data;
};

export const getStudentQuiz = async (lessonId: string, quizId: string): Promise<StudentQuiz> => {
  const response = await apiClient.get<GetStudentQuizResponse>(
    `/api/lessons/${lessonId}/quizzes/${quizId}/student`
  );
  return response.data.data;
};

export const quizzesApi = {
  getLessonQuizzes,
  getStudentQuiz,
};

export default quizzesApi;
