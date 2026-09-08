export interface ExamSubmissionAnswer {
  QuestionId: string;
  selectedAnswer: string;
}

export interface SubmitExamPayload {
  selectedOption: ExamSubmissionAnswer[];
}

export interface ExamSubmissionResult {
  score: number;
  totalQuestions: number;
  isPassed: boolean;
  submissionId: string;
}

export interface SubmitExamResponse {
  message: string;
  data: ExamSubmissionResult;
}
