export interface ExamListItem {
  _id: string;
  courseID: string;
  title: string;
  duration: number; // in minutes
  isActive: boolean;
  startAt?: string; // Optional scheduled start date/time (ISO string)
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCourseExamsResponse {
  message: string;
  data: ExamListItem[];
}

export interface StudentExamQuestion {
  _id: string;
  type?: 'MCQ' | 'ESSAY';
  points?: number;
  question: string;
  questionImage?: string;
  options?: string[];
}

export interface StudentExam extends ExamListItem {
  questions: StudentExamQuestion[];
}

export interface GetStudentExamResponse {
  message: string;
  data: StudentExam;
}

export interface TeacherExamQuestion {
  _id?: string;
  type: 'MCQ' | 'ESSAY';
  points: number;
  question: string;
  questionImage?: string;
  options?: string[];
  answer?: string;
}

export interface TeacherExam extends ExamListItem {
  questions: TeacherExamQuestion[];
}

export interface GetTeacherExamResponse {
  message: string;
  data: TeacherExam;
}

export interface CreateTeacherExamPayload {
  title: string;
  duration: number;
  startAt?: string;
  questions: {
    type: 'MCQ' | 'ESSAY';
    points: number;
    question: string;
    questionImage?: string;
    options?: string[];
    answer?: string;
  }[];
}

export interface UpdateTeacherExamPayload {
  title?: string;
  duration?: number;
  startAt?: string;
  questions?: {
    type: 'MCQ' | 'ESSAY';
    points: number;
    question: string;
    questionImage?: string;
    options?: string[];
    answer?: string;
  }[];
  isActive?: boolean;
}

export interface TeacherExamMutationResponse {
  message: string;
  data: TeacherExam;
}


