import React, { useState, useEffect, useRef } from 'react';
import { useStudentExam } from './useStudentExam';
import { useSubmitExam } from './useSubmitExam';
import { useStudentExamHistory } from '../../student/hooks/useStudentExamHistory';
import type { ExamSubmissionResult } from '../types/examSubmission';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

interface ExtendedExamHistoryItem {
  _id: string;
  score?: number;
  totalScore?: number;
  totalExamPoints?: number;
  totalQuestions?: number;
  status?: 'PENDING' | 'GRADED';
}

export const useExamRunnerState = (courseId: string, examId: string) => {
  const { data: exam, isLoading, isError, error, refetch } = useStudentExam(courseId, examId);
  const submitExamMutation = useSubmitExam();
  const { data: examHistoryData } = useStudentExamHistory({ page: 1, limit: 100 });

  const sessionStartKey = `lms_exam_session_start_${examId}`;
  const draftAnswersKey = `lms_exam_draft_answers_${examId}`;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    try {
      const savedDraft = localStorage.getItem(`lms_exam_draft_answers_${examId}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return {};
  });
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submissionResultState, setSubmissionResult] = useState<ExamSubmissionResult | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [timeExpiredNoAnswers, setTimeExpiredNoAnswers] = useState<boolean>(false);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [saveIndicator, setSaveIndicator] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isAutoSubmittedRef = useRef<boolean>(false);
  const userAnswersRef = useRef<Record<string, string>>(userAnswers);

  const existingSubmission = React.useMemo(() => {
    if (!examHistoryData?.data) return null;
    return examHistoryData.data.find((sub) => {
      const subExamId = typeof sub.examID === 'string' ? sub.examID : sub.examID?._id;
      return subExamId && String(subExamId).trim() === String(examId).trim();
    });
  }, [examHistoryData, examId]);

  const submissionResult = React.useMemo<ExamSubmissionResult | null>(() => {
    if (submissionResultState) return submissionResultState;
    if (existingSubmission) {
      const ext = existingSubmission as unknown as ExtendedExamHistoryItem;
      const scoreVal = ext.totalScore ?? existingSubmission.score ?? 0;
      const totalPointsVal = ext.totalExamPoints ?? ext.totalQuestions ?? scoreVal;
      return {
        submissionID: existingSubmission._id,
        status: ext.status || 'GRADED',
        totalScore: scoreVal,
        score: scoreVal,
        totalExamPoints: totalPointsVal,
        totalQuestions: totalPointsVal,
      };
    }
    return null;
  }, [submissionResultState, existingSubmission]);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  const untilStartLeft = React.useMemo<number | null>(() => {
    if (!exam || !exam.startAt) return null;
    const startMs = new Date(exam.startAt).getTime();
    const diffSeconds = Math.floor((startMs - nowMs) / 1000);
    return diffSeconds > 0 ? diffSeconds : null;
  }, [exam, nowMs]);

  const timeLeft = React.useMemo<number | null>(() => {
    if (!exam || typeof exam.duration !== 'number' || exam.duration <= 0 || submissionResult || timeExpiredNoAnswers) {
      return null;
    }
    if (untilStartLeft !== null && untilStartLeft > 0) {
      return null;
    }

    const totalSeconds = exam.duration * 60;
    let sessionStartMs = nowMs;

    try {
      const storedStart = localStorage.getItem(sessionStartKey);
      if (storedStart) {
        sessionStartMs = Number(storedStart);
      } else {
        localStorage.setItem(sessionStartKey, sessionStartMs.toString());
      }
    } catch {
      // Ignore storage errors
    }

    const elapsedSeconds = Math.floor((nowMs - sessionStartMs) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  }, [exam, untilStartLeft, submissionResult, timeExpiredNoAnswers, sessionStartKey, nowMs]);

  useEffect(() => {
    if (submissionResult || timeExpiredNoAnswers) return;
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [submissionResult, timeExpiredNoAnswers]);

  const cleanupLocalStorage = () => {
    try {
      localStorage.removeItem(sessionStartKey);
      localStorage.removeItem(draftAnswersKey);
    } catch {
      // Ignore
    }
  };

  const handleDoSubmit = (isAuto = false) => {
    if (isSubmittingRef.current || submitExamMutation.isPending || submissionResult) {
      return;
    }

    const answeredCount = (exam?.questions || []).filter((q) => {
      const ans = userAnswersRef.current[q._id];
      return Boolean(ans && ans.trim());
    }).length;

    if (answeredCount === 0) {
      setShowConfirmModal(false);
      if (isAuto) {
        setTimeExpiredNoAnswers(true);
        cleanupLocalStorage();
        return;
      }
      setSubmitErrorMessage('يجب الإجابة على سؤال واحد على الأقل قبل تسليم الامتحان.');
      return;
    }

    const answersPayload = (exam?.questions || []).map((q) => {
      const ans = userAnswersRef.current[q._id];
      const validAns = ans && ans.trim() ? ans.trim() : 'لم تتم الإجابة';
      return {
        questionID: q._id,
        type: (q.type || 'MCQ') as 'MCQ' | 'ESSAY',
        studentAnswer: validAns,
      };
    });

    setSubmitErrorMessage(null);
    isSubmittingRef.current = true;
    setShowConfirmModal(false);
    if (isAuto) {
      setIsAutoSubmitted(true);
    }

    submitExamMutation.mutate(
      {
        courseId,
        examId,
        payload: { answers: answersPayload },
      },
      {
        onSuccess: (result) => {
          setSubmissionResult(result);
          cleanupLocalStorage();
        },
        onError: (err) => {
          isSubmittingRef.current = false;
          setSubmitErrorMessage(toArabicErrorMessage(err, 'لا يمكنك إجراء الامتحان أكثر من مرة (تم تسليم الامتحان سابقاً).'));
        },
      }
    );
  };

  const handleDoSubmitRef = useRef(handleDoSubmit);
  useEffect(() => {
    handleDoSubmitRef.current = handleDoSubmit;
  });

  useEffect(() => {
    if (timeLeft === null || submissionResult || timeExpiredNoAnswers || submitExamMutation.isPending || (untilStartLeft !== null && untilStartLeft > 0)) {
      return;
    }

    if (timeLeft <= 0) {
      if (!isAutoSubmittedRef.current && !isSubmittingRef.current) {
        isAutoSubmittedRef.current = true;
        const timer = setTimeout(() => {
          handleDoSubmitRef.current(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [timeLeft, submissionResult, timeExpiredNoAnswers, submitExamMutation.isPending, untilStartLeft]);

  const handleSelectOption = (questionId: string, selectedAnswer: string) => {
    if (submissionResult || timeExpiredNoAnswers || submitExamMutation.isPending || (timeLeft !== null && timeLeft <= 0)) {
      return;
    }

    setSubmitErrorMessage(null);
    setUserAnswers((prev) => {
      const updated = {
        ...prev,
        [questionId]: selectedAnswer,
      };
      try {
        localStorage.setItem(draftAnswersKey, JSON.stringify(updated));
      } catch {
        // Ignore storage write error
      }
      return updated;
    });

    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    exam,
    isLoading,
    isError,
    error,
    refetch,
    submitExamMutation,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    timeLeft,
    untilStartLeft,
    showConfirmModal,
    setShowConfirmModal,
    submissionResult,
    submitErrorMessage,
    setSubmitErrorMessage,
    timeExpiredNoAnswers,
    isAutoSubmitted,
    saveIndicator,
    handleSelectOption,
    handleDoSubmit,
    formatTime,
  };
};
