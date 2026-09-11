export interface ExamStudentAnswerItem {
  questionID: string;
  type: 'MCQ' | 'ESSAY';
  studentAnswer: string;
}

export interface SubmitExamPayload {
  answers: ExamStudentAnswerItem[];
}

export interface ExamSubmissionResult {
  score?: number;
  totalQuestions?: number;
  isPassed?: boolean;
  submissionID?: string;
  submissionId?: string;
  status?: 'PENDING' | 'GRADED';
  totalExamPoints?: number;
}

export interface SubmitExamResponse {
  message: string;
  data: ExamSubmissionResult;
}

export interface TeacherExamSubmissionStudentInfo {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface TeacherExamSubmissionItem {
  _id: string;
  examID: {
    _id: string;
    title: string;
  };
  studentID: TeacherExamSubmissionStudentInfo;
  status: 'PENDING' | 'GRADED' | 'NEEDS_GRADING';
  mcqScore: number;
  essayScore: number;
  totalScore: number;
  totalExamPoints: number;
  gradedBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTeacherExamSubmissionsResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: TeacherExamSubmissionItem[];
}

export interface DetailedAnswerItem {
  questionID: string;
  type: 'MCQ' | 'ESSAY';
  studentAnswer?: string;
  questionText?: string;
  selectedAnswer?: string;
  correctAnswer?: string;
  essayAnswerText?: string;
  score: number;
  maxScore?: number;
  isCorrect?: boolean;
  teacherFeedback?: string;
}

export interface DetailedExamSubmission {
  _id: string;
  examID: {
    _id: string;
    title: string;
    duration?: number;
  };
  studentID: TeacherExamSubmissionStudentInfo;
  status: 'PENDING' | 'GRADED' | 'NEEDS_GRADING';
  mcqScore: number;
  essayScore: number;
  totalScore: number;
  totalExamPoints: number;
  answers: DetailedAnswerItem[];
  gradedBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamSubmissionDetailsResponse {
  message: string;
  data: DetailedExamSubmission;
}

export interface GradeInputItem {
  questionID: string;
  score: number;
  teacherFeedback?: string;
}

export interface GradeEssayPayload {
  grades: GradeInputItem[];
}

export interface GradeEssayResponse {
  message: string;
  data: DetailedExamSubmission;
}

