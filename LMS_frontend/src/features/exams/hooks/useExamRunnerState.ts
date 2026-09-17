import React, { useState, useEffect, useRef } from 'react';
import { useStudentExam } from './useStudentExam';
import { useSubmitExam } from './useSubmitExam';
import { useStudentExamHistory } from '../../student/hooks/useStudentExamHistory';
import type { ExamSubmissionResult } from '../types/examSubmission';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

export const useExamRunnerState = (courseId: string, examId: string) => {
  const { data: exam, isLoading, isError, error, refetch } = useStudentExam(courseId, examId);
  const submitExamMutation = useSubmitExam();
  const { data: examHistoryData } = useStudentExamHistory({ page: 1, limit: 100 });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [untilStartLeft, setUntilStartLeft] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmissionResult | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [timeExpiredNoAnswers, setTimeExpiredNoAnswers] = useState<boolean>(false);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [saveIndicator, setSaveIndicator] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isAutoSubmittedRef = useRef<boolean>(false);
  const userAnswersRef = useRef<Record<string, string>>(userAnswers);

  const sessionStartKey = `lms_exam_session_start_${examId}`;
  const draftAnswersKey = `lms_exam_draft_answers_${examId}`;

  const existingSubmission = React.useMemo(() => {
    if (!examHistoryData?.data) return null;
    return examHistoryData.data.find((sub) => {
      const subExamId = typeof sub.examID === 'string' ? sub.examID : sub.examID?._id;
      return subExamId && String(subExamId).trim() === String(examId).trim();
    });
  }, [examHistoryData, examId]);

  useEffect(() => {
    if (existingSubmission && !submissionResult) {
      const scoreVal = (existingSubmission as any).totalScore ?? existingSubmission.score ?? 0;
      const totalPointsVal = (existingSubmission as any).totalExamPoints ?? (existingSubmission as any).totalQuestions ?? scoreVal;
      setSubmissionResult({
        submissionID: existingSubmission._id,
        status: (existingSubmission as any).status || 'GRADED',
        totalScore: scoreVal,
        score: scoreVal,
        totalExamPoints: totalPointsVal,
        totalQuestions: totalPointsVal,
      });
    }
  }, [existingSubmission, submissionResult]);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftAnswersKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          setUserAnswers(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [draftAnswersKey]);

  useEffect(() => {
    if (!exam || !exam.startAt) {
      setUntilStartLeft(null);
      return;
    }

    const startMs = new Date(exam.startAt).getTime();
    const nowMs = Date.now();
    const diffSeconds = Math.floor((startMs - nowMs) / 1000);

    if (diffSeconds > 0) {
      setUntilStartLeft(diffSeconds);
      const interval = setInterval(() => {
        const remaining = Math.floor((startMs - Date.now()) / 1000);
        if (remaining <= 0) {
          setUntilStartLeft(null);
          clearInterval(interval);
        } else {
          setUntilStartLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setUntilStartLeft(null);
    }
  }, [exam]);

  useEffect(() => {
    if (!exam || typeof exam.duration !== 'number' || exam.duration <= 0 || submissionResult || timeExpiredNoAnswers) {
      return;
    }

    if (untilStartLeft !== null && untilStartLeft > 0) {
      return;
    }

    const totalSeconds = exam.duration * 60;
    let sessionStartMs = Date.now();

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

    const elapsedSeconds = Math.floor((Date.now() - sessionStartMs) / 1000);
    const remaining = Math.max(0, totalSeconds - elapsedSeconds);
    setTimeLeft(remaining);
  }, [exam, untilStartLeft, submissionResult, timeExpiredNoAnswers, sessionStartKey]);

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
        handleDoSubmitRef.current(true);
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (!isAutoSubmittedRef.current && !isSubmittingRef.current) {
            isAutoSubmittedRef.current = true;
            handleDoSubmitRef.current(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
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
