export interface HistorySelectedOption {
  QuestionId: string;
  selectedAnswer: string;
}

export interface BaseAssessmentHistoryItem {
  _id: string;
  studentID: {
    _id: string;
    name: string;
  };
  score: number;
  isPassed: boolean;
  selectedOption: HistorySelectedOption[];
  createdAt: string;
  updatedAt?: string;
}

export interface QuizHistoryItem extends BaseAssessmentHistoryItem {
  quizID: {
    _id: string;
    title: string;
  };
}

export interface QuizHistoryResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: QuizHistoryItem[];
}

export interface ExamHistoryItem extends BaseAssessmentHistoryItem {
  examID: {
    _id: string;
    title: string;
  };
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
