export interface Course {
  _id: string;
  title: string;
  isActive?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCoursesResponse {
  message: string;
  data: Course[];
}
