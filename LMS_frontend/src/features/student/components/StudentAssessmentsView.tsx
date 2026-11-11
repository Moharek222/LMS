import React, { useState } from 'react';
import { FileText, History, Award } from 'lucide-react';
import ExamList from '../../exams/components/ExamList';
import ExamPreview from '../../exams/components/ExamPreview';
import ExamRunner from '../../exams/components/ExamRunner';
import StudentQuizHistory from './StudentQuizHistory';
import StudentExamHistory from './StudentExamHistory';

interface StudentAssessmentsViewProps {
  selectedCourseId: string;
  selectedExamId: string;
  isSolvingExam: boolean;
  setIsSolvingExam: (val: boolean) => void;
  effectiveCourses: Array<{ _id: string; title: string }>;
  onSelectCourse: (courseId: string) => void;
  onSelectExam: (examId: string) => void;
  onBackToExams: () => void;
  onCloseExam: () => void;
}

export const StudentAssessmentsView: React.FC<StudentAssessmentsViewProps> = ({
  selectedCourseId,
  selectedExamId,
  isSolvingExam,
  setIsSolvingExam,
  effectiveCourses,
  onSelectCourse,
  onSelectExam,
  onBackToExams,
  onCloseExam,
}) => {
  const [assessmentSubTab, setAssessmentSubTab] = useState<'exams' | 'quizzes-history' | 'exams-history'>('exams');

  if (selectedExamId) {
    return isSolvingExam ? (
      <ExamRunner
        courseId={selectedCourseId}
        examId={selectedExamId}
        onClose={onCloseExam}
      />
    ) : (
      <ExamPreview
        courseId={selectedCourseId}
        examId={selectedExamId}
        onBack={onBackToExams}
        onStartSolving={() => setIsSolvingExam(true)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setAssessmentSubTab('exams')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            assessmentSubTab === 'exams'
              ? 'bg-[#0D8A82] text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={16} />
          <span>الامتحانات الشاملة</span>
        </button>
        <button
          onClick={() => setAssessmentSubTab('quizzes-history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            assessmentSubTab === 'quizzes-history'
              ? 'bg-[#0D8A82] text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History size={16} />
          <span>سجل تقييمات الكويزات</span>
        </button>
        <button
          onClick={() => setAssessmentSubTab('exams-history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            assessmentSubTab === 'exams-history'
              ? 'bg-[#0D8A82] text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award size={16} />
          <span>سجل الامتحانات الشاملة</span>
        </button>
      </div>

      {assessmentSubTab === 'exams' && (
        <ExamList
          courseId={selectedCourseId}
          courses={effectiveCourses}
          onSelectCourse={onSelectCourse}
          onSelectExam={(exam) => onSelectExam(exam._id)}
        />
      )}
      {assessmentSubTab === 'quizzes-history' && <StudentQuizHistory />}
      {assessmentSubTab === 'exams-history' && <StudentExamHistory />}
    </div>
  );
};

