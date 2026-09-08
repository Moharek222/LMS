export interface HistorySelectedOption {
  QuestionId: string;
  selectedAnswer: string;
}

export interface QuizHistoryItem {
  _id: string;
  studentID: {
    _id: string;
    name: string;
  };
  quizID: {
    _id: string;
    title: string;
  };
  score: number;
  isPassed: boolean;
  selectedOption: HistorySelectedOption[];
  createdAt: string;
  updatedAt?: string;
}

export interface QuizHistoryResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: QuizHistoryItem[];
}

export interface ExamHistoryItem {
  _id: string;
  studentID: {
    _id: string;
    name: string;
  };
  examID: {
    _id: string;
    title: string;
  };
  score: number;
  isPassed: boolean;
  selectedOption: HistorySelectedOption[];
  createdAt: string;
  updatedAt?: string;
}

export interface ExamHistoryResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: ExamHistoryItem[];
}

export interface StudentHistoryQueryParams {
  page?: number;
  limit?: number;
}
