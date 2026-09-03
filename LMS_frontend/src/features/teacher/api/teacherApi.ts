import apiClient from '../../../services/apiClient';
import axios from 'axios';
import type { Course } from '../../courses/types/course';
import type { Lesson } from '../../lessons/types/lesson';
import type { QuizListItem } from '../../quizzes/types/quiz';

export interface CreateCoursePayload {
  title: string;
  isPublished?: boolean;
}

export interface CreateLessonPayload {
  title: string;
  description?: string;
  contentUrl: string;
  order: number;
  requiresPassing?: boolean;
}

export interface QuizQuestionPayload {
  question: string;
  options: string[];
  answer: string;
}

export interface CreateQuizPayload {
  title: string;
  duration: number;
  passingPercentage: number;
  questions: QuizQuestionPayload[];
}

export interface GenerateUploadUrlResponse {
  message: string;
  data: {
    uploadUrl: string;
    fileKey: string;
  };
}

export const createCourse = async (payload: CreateCoursePayload): Promise<Course> => {
  const response = await apiClient.post<{ message: string; data: Course }>('/api/courses', payload);
  return response.data.data;
};

export const getTeacherCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<{ message: string; data: Course[] }>('/api/courses');
  return response.data.data || [];
};

export const generateUploadUrl = async (contentType: string): Promise<{ uploadUrl: string; fileKey: string }> => {
  const response = await apiClient.post<GenerateUploadUrlResponse>('/api/lessons/generate-upload-url', {
    contentType,
  });
  return response.data.data;
};

export const uploadVideoToR2 = async (
  uploadUrl: string,
  file: File,
  onProgress?: (percentage: number) => void
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'video/mp4',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
};

export const createLesson = async (courseId: string, payload: CreateLessonPayload): Promise<Lesson> => {
  const response = await apiClient.post<{ message: string; data: Lesson }>('/api/lessons', {
    ...payload,
    courseID: courseId,
  });
  return response.data.data;
};

export const createQuiz = async (lessonId: string, payload: CreateQuizPayload): Promise<QuizListItem> => {
  const response = await apiClient.post<{ message: string; data: QuizListItem }>(
    `/api/lessons/${lessonId}/quizzes`,
    payload
  );
  return response.data.data;
};

export const teacherApi = {
  createCourse,
  getTeacherCourses,
  generateUploadUrl,
  uploadVideoToR2,
  createLesson,
  createQuiz,
};

export default teacherApi;
