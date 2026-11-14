import { Grade } from '../../../types/grade';
import type { AcademicTrack } from '../../../types/academicTrack';

export interface Course {
  _id: string;
  title: string;
  grade?: Grade;
  academicTrack?: AcademicTrack;
  isActive?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCoursesResponse {
  message: string;
  data: Course[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface CreateCoursePayload {
  title: string;
  grade: Grade;
  academicTrack?: AcademicTrack;
  isPublished?: boolean;
}

export interface UpdateCoursePayload {
  title?: string;
  academicTrack?: AcademicTrack;
  isPublished?: boolean;
}

export interface CourseResponse {
  message: string;
  data: Course;
}

export interface DeleteCourseResponse {
  message: string;
  data: Course;
}
