export interface Lesson {
  _id: string;
  courseID: string;
  title: string;
  description?: string;
  contentUrl?: string;
  order: number;
  requiresPassing: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCourseLessonsResponse {
  message: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  data: Lesson[];
}
