import React from 'react';
import {
  X,
  User,
  Phone,
  CalendarCheck,
  Video,
  Award,
  Loader2,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { GroupStudent } from '../../types/groupManagement';
import { getStudentAttendancePercentage } from '../../../attendance/api/attendanceApi';
import { getStudentWatchHistory } from '../../../lessons/api/progressApi';
import apiClient from '../../../../services/apiClient';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GroupStudent | null;
  groupId: string;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student,
  groupId,
}) => {
  const studentId = student?._id || '';

  
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['student-group-attendance-percentage', groupId, studentId],
    queryFn: () => getStudentAttendancePercentage(groupId, studentId),
    enabled: Boolean(isOpen && groupId && studentId),
  });

  
  const { data: watchHistory, isLoading: isLoadingWatchHistory } = useQuery({
    queryKey: ['student-watch-history-teacher', studentId],
    queryFn: () => getStudentWatchHistory(studentId),
    enabled: Boolean(isOpen && studentId),
  });

  // Fetch student quiz submissions for teacher view
  const { data: quizSubmissions, isLoading: isLoadingQuizSubmissions } = useQuery({
    queryKey: ['student-quiz-submissions-teacher', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      try {
        const response = await apiClient.get<{ data: any[] }>(`/api/quizzes/student-history/${studentId}`);
        return response.data?.data || [];
      } catch {
        try {
          const response = await apiClient.get<{ data: any[] }>(`/api/students/quiz-history`);
          return response.data?.data || [];
        } catch {
          return [];
        }
      }
    },
    enabled: Boolean(isOpen && studentId),
  });

  if (!isOpen || !student) return null;

  const attendancePercentage = attendanceData?.attendancePercentage ?? 0;

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shadow-2xs">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">تفاصيل وسجل الطالب</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                اسم الطالب: <span className="text-[#0D8A82] font-extrabold">{student.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        
        <div className="overflow-y-auto flex-1 space-y-6 pr-1 custom-scrollbar">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-bold block">أرقام التواصل</span>
              <div className="text-xs font-bold text-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#0D8A82]" />
                  <span>هاتف الطالب: {student.phone || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-amber-600" />
                  <span className={student.parentPhone ? "text-amber-900 font-bold" : "text-slate-400"}>
                    ولي الأمر: {student.parentPhone || 'غير مسجل'}
                  </span>
                </div>
              </div>
            </div>

            
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CalendarCheck size={16} className="text-[#0D8A82]" />
                  <span>نسبة الحضور في هذه المجموعة</span>
                </span>
                <span className="text-sm font-black text-[#0D8A82]">
                  {isLoadingAttendance ? '...' : `${attendancePercentage}%`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-teal-200/60">
                <div
                  className="h-full bg-[#0D8A82] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, attendancePercentage))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section 1: Watch History */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 pb-1 border-b border-slate-100">
              <Video size={18} className="text-[#0D8A82]" />
              <span>سجل المشاهدة والدروس المكتملة</span>
            </div>

            {isLoadingWatchHistory ? (
              <div className="py-6 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                <span>جاري جلب سجل مشاهدة الفيديو...</span>
              </div>
            ) : !watchHistory || watchHistory.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400 font-semibold">
                لم يتم تسجيل أي مشاهدات دروس لهذا الطالب بعد.
              </div>
            ) : (
              <div className="space-y-2.5">
                {watchHistory.map((historyItem) => {
                  const courseTitle = typeof historyItem.courseID === 'object' ? historyItem.courseID?.title : 'الكورس';
                  return (
                    <div key={historyItem._id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                        <span className="flex items-center gap-1.5 text-[#0D8A82]">
                          <BookOpen size={14} />
                          <span>{courseTitle}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0D8A82] text-[10px] font-bold border border-teal-100">
                          {historyItem.watchedLessons?.length || 0} دروس مشاهدة
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {historyItem.watchedLessons?.map((lesson) => (
                          <span
                            key={lesson._id}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 inline-flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>{lesson.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 pb-1 border-b border-slate-100">
              <Award size={18} className="text-amber-500" />
              <span>سجل نتائج وتكليفات الكويزات</span>
            </div>

            {isLoadingQuizSubmissions ? (
              <div className="py-6 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-amber-500" />
                <span>جاري تحميل نتائج الكويزات...</span>
              </div>
            ) : !quizSubmissions || quizSubmissions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400 font-semibold">
                لا توجد تسليمات كويزات مسجلة لهذا الطالب حتى الآن.
              </div>
            ) : (
              <div className="space-y-2">
                {quizSubmissions.map((sub: any, idx: number) => {
                  const quizTitle = typeof sub.quizID === 'object' ? sub.quizID?.title : 'الكويز';
                  const isPassed = sub.isPassed;
                  return (
                    <div
                      key={sub._id || idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h5 className="text-xs font-extrabold text-slate-800">{quizTitle}</h5>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                          <span>الدرجة: {sub.score}</span>
                          <span>•</span>
                          <span className={isPassed ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
                            {isPassed ? 'ناجح 🏆' : 'لم يجتز'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black border ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isPassed ? 'اجتاز الاختبار' : 'محاولة جديدة'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

       
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
