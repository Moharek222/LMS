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

export interface LessonVideoData {
  title: string;
  videoUrl: string;
}

export interface GetLessonVideoResponse {
  message: string;
  data: LessonVideoData;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
  contentUrl?: string;
  order?: number;
  requiresPassing?: boolean;
  isActive?: boolean;
}

export interface UpdateLessonResponse {
  message: string;
  data: Lesson;
}

export interface DeleteLessonResponse {
  message: string;
}
