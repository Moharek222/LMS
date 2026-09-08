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

export interface TeacherQuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  answer: string;
}

export interface TeacherQuiz extends QuizListItem {
  questions: TeacherQuizQuestion[];
}

export interface UpdateQuizPayload {
  title?: string;
  duration?: number;
  passingPercentage?: number;
  questions?: TeacherQuizQuestion[];
  isActive?: boolean;
}

export interface GetLessonQuizzesResponse {
  message: string;
  data: QuizListItem[];
}

export interface GetStudentQuizResponse {
  message: string;
  data: StudentQuiz;
}

export interface GetTeacherQuizResponse {
  message: string;
  data: TeacherQuiz;
}

export interface UpdateQuizResponse {
  message: string;
  data: TeacherQuiz;
}

export interface DeleteQuizResponse {
  message: string;
  data?: TeacherQuiz;
}

