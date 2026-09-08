import React, { useState, useEffect } from 'react';
import { Award, Plus, Loader2, AlertTriangle, BookOpen, RefreshCw } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCourseExams } from '../../exams/hooks/useCourseExams';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';
import type { ExamListItem } from '../../exams/types/exam';
import { ExamCard } from './exams/ExamCard';
import { CreateExamModal } from './exams/CreateExamModal';
import { EditExamModal } from './exams/EditExamModal';
import { DeactivateExamModal } from './exams/DeactivateExamModal';
import { ExamSubmissionsModal } from './exams/ExamSubmissionsModal';
import { ExamStatsModal } from './exams/ExamStatsModal';

export const TeacherExamManager: React.FC = () => {
  const toast = useToast();
  const {
    data: courses,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
    error: coursesError,
    refetch: refetchCourses,
  } = useTeacherCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const {
    data: exams,
    isLoading: isLoadingExams,
    isError: isExamsError,
    error: examsError,
    refetch: refetchExams,
  } = useCourseExams(selectedCourseId);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingExamId, setEditingExamId] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deactivatingExamId, setDeactivatingExamId] = useState<string>('');
  const [deactivatingExamTitle, setDeactivatingExamTitle] = useState<string>('');
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Submissions Modal State
  const [submissionsExamId, setSubmissionsExamId] = useState<string>('');
  const [submissionsExamTitle, setSubmissionsExamTitle] = useState<string>('');

  // Stats Modal State
  const [statsExamId, setStatsExamId] = useState<string>('');
  const [statsExamTitle, setStatsExamTitle] = useState<string>('');

  const handleOpenEditModal = (examId: string) => {
    setEditingExamId(examId);
    setIsEditModalOpen(true);
  };

  const handleOpenDeactivateModal = (examId: string, examTitle: string) => {
    setDeactivatingExamId(examId);
    setDeactivatingExamTitle(examTitle);
    setIsDeactivateModalOpen(true);
  };

  const handleOpenSubmissionsModal = (examId: string, examTitle: string) => {
    setSubmissionsExamId(examId);
    setSubmissionsExamTitle(examTitle);
  };

  const handleOpenStatsModal = (examId: string, examTitle: string) => {
    setStatsExamId(examId);
    setStatsExamTitle(examTitle);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">إدارة الامتحانات الشاملة</h2>
              <p className="text-xs text-slate-500 font-semibold">
                استعراض وتنظيم الامتحانات الشاملة وتصحيح وإجابات الطلاب
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!selectedCourseId) {
              toast.error('يرجى اختيار الكورس أولاً');
              return;
            }
            setIsCreateModalOpen(true);
          }}
          disabled={!selectedCourseId || isLoadingCourses}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 active:scale-[0.99] transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus size={16} />
          <span>إضافة امتحان جديد</span>
        </button>
      </div>

      
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
            <BookOpen size={16} className="text-[#0D8A82]" />
            <span>اختر الكورس الدراسي:</span>
          </label>
          {courses && courses.length > 0 && (
            <span className="text-[11px] font-bold text-slate-400">
              عدد الكورسات: {courses.length}
            </span>
          )}
        </div>

        {isLoadingCourses ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
            <span>جاري تحميل الكورسات...</span>
          </div>
        ) : isCoursesError ? (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{toArabicErrorMessage(coursesError, 'تعذر تحميل الكورسات')}</span>
            </div>
            <button
              onClick={() => refetchCourses()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200 text-amber-800 text-center space-y-1">
            <p className="text-xs font-bold">لا توجد كورسات دراسية مضافة حتى الآن.</p>
            <p className="text-[11px] text-amber-600 font-semibold">
              يرجى إضافة كورس دراسي أولاً للتمكن من إضافة وإدارة الامتحانات الشاملة.
            </p>
          </div>
        ) : (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition cursor-pointer"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        )}
      </div>

    
      {!selectedCourseId ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <BookOpen size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800">يرجى اختيار كورس دراسي لعرض امتحاناته</h4>
        </div>
      ) : isLoadingExams ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-60">
          <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
          <p className="text-xs font-bold text-slate-600">جاري تحميل امتحانات الكورس...</p>
        </div>
      ) : isExamsError ? (
        <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
            <AlertTriangle size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل الامتحانات</h4>
          <p className="text-xs text-slate-600 font-semibold max-w-md">
            {toArabicErrorMessage(examsError, 'تعذر تحميل امتحانات الكورس حالياً.')}
          </p>
          <button
            onClick={() => refetchExams()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
          >
            <RefreshCw size={14} />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : !exams || exams.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <Award size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800">لا توجد امتحانات مضافة لهذا الكورس حتى الآن</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
            انقر على زر "إضافة امتحان جديد" في الأعلى لإنشاء امتحان جديد لهذا الكورس.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-[#0D8A82]" />
              <span>الامتحانات المتاحة للكورس المحدد</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              عدد الامتحانات: {exams.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam: ExamListItem) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onEdit={handleOpenEditModal}
                onDeactivate={handleOpenDeactivateModal}
                onViewSubmissions={handleOpenSubmissionsModal}
                onViewStats={handleOpenStatsModal}
              />
            ))}
          </div>
        </div>
      )}

      
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedCourseId={selectedCourseId}
      />

      <EditExamModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExamId('');
        }}
        selectedCourseId={selectedCourseId}
        editingExamId={editingExamId}
      />

      <DeactivateExamModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setDeactivatingExamId('');
          setDeactivatingExamTitle('');
        }}
        selectedCourseId={selectedCourseId}
        deactivatingExamId={deactivatingExamId}
        deactivatingExamTitle={deactivatingExamTitle}
      />

      {/* Submissions Modal */}
      {submissionsExamId && (
        <ExamSubmissionsModal
          isOpen={Boolean(submissionsExamId)}
          onClose={() => {
            setSubmissionsExamId('');
            setSubmissionsExamTitle('');
          }}
          courseId={selectedCourseId}
          examId={submissionsExamId}
          examTitle={submissionsExamTitle}
        />
      )}

      {/* Stats Modal */}
      {statsExamId && (
        <ExamStatsModal
          isOpen={Boolean(statsExamId)}
          onClose={() => {
            setStatsExamId('');
            setStatsExamTitle('');
          }}
          courseId={selectedCourseId}
          examId={statsExamId}
          examTitle={statsExamTitle}
        />
      )}
    </div>
  );
};

export default TeacherExamManager;
