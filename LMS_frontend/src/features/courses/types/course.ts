import { Grade } from '../../../types/grade';

export interface Course {
  _id: string;
  title: string;
  grade?: Grade;
  isActive?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCoursesResponse {
  message: string;
  data: Course[];
}

export interface CreateCoursePayload {
  title: string;
  grade: Grade;
  isPublished?: boolean;
}

export interface UpdateCoursePayload {
  title?: string;
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
