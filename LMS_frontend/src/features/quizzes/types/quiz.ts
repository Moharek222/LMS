export interface QuizListItem {
  _id: string;
  lessonID: string;
  title: string;
  duration: number; // in minutes
  passingPercentage: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentQuestion {
  _id: string;
  question: string;
  options: string[];
}

export interface StudentQuiz extends QuizListItem {
  questions: StudentQuestion[];
}

export interface GetLessonQuizzesResponse {
  message: string;
  data: QuizListItem[];
}

export interface GetStudentQuizResponse {
  message: string;
  data: StudentQuiz;
}
