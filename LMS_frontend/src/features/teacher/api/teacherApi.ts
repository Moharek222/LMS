import apiClient from '../../../services/apiClient';
import axios from 'axios';
import type { Course, CreateCoursePayload, UpdateCoursePayload } from '../../courses/types/course';
import type { Lesson } from '../../lessons/types/lesson';
import type { QuizListItem } from '../../quizzes/types/quiz';

export type { CreateCoursePayload, UpdateCoursePayload };

export interface CreateLessonPayload {
  title: string;
  description?: string;
  contentUrl: string;
  pdfKey?: string;
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

export interface GeneratePdfUploadUrlResponse {
  message: string;
  data: {
    uploadUrl: string;
    pdfKey: string;
  };
}

export const createCourse = async (payload: CreateCoursePayload): Promise<Course> => {
  const response = await apiClient.post<{ message: string; data: Course }>('/api/courses', payload);
  return response.data.data;
};

export const updateCourse = async (courseId: string, payload: UpdateCoursePayload): Promise<Course> => {
  const response = await apiClient.put<{ message: string; data: Course }>(`/api/courses/${courseId}`, payload);
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

export const generatePdfUploadUrl = async (): Promise<{ uploadUrl: string; pdfKey: string }> => {
  const response = await apiClient.post<GeneratePdfUploadUrlResponse>('/api/lessons/generate-pdf-upload-url', {
    contentType: 'application/pdf',
  });
  return response.data.data;
};

export const uploadPdfToR2 = async (
  uploadUrl: string,
  file: File,
  onProgress?: (percentage: number) => void
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': 'application/pdf',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
};

export const getLessonPdfPreview = async (
  lessonId: string
): Promise<{ title: string; pdfPreviewUrl: string }> => {
  const response = await apiClient.get<{ message: string; data: { title: string; pdfPreviewUrl: string } }>(
    `/api/lessons/${lessonId}/pdf`
  );
  return response.data.data;
};

export const createLesson = async (courseId: string, payload: CreateLessonPayload): Promise<Lesson> => {
  const response = await apiClient.post<{ message: string; data: Lesson }>(
    `/api/lessons/${courseId}`,
    payload
  );
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
  updateCourse,
  getTeacherCourses,
  generateUploadUrl,
  uploadVideoToR2,
  generatePdfUploadUrl,
  uploadPdfToR2,
  getLessonPdfPreview,
  createLesson,
  createQuiz,
};

export default teacherApi;
