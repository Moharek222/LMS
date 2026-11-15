import React from 'react';
import { KeyRound, GraduationCap, Sparkles, Info } from 'lucide-react';
import { Grade } from '../../../../types/grade';
import { AcademicTrack } from '../../../../types/academicTrack';
import type { Group } from '../../types/groupManagement';
import type {
  GradeFilterValue,
  TrackFilterValue,
  AccessCodeCounts,
} from '../../hooks/useTeacherAccessCodeManager';

interface AccessCodesGradeTabsProps {
  gradeFilter: GradeFilterValue;
  trackFilter: TrackFilterValue;
  selectedGroupId: string;
  counts: AccessCodeCounts;
  totalCodesCount: number;
  gradeGroups: Group[];
  onSelectGrade: (grade: GradeFilterValue) => void;
  onSelectTrack: (track: TrackFilterValue) => void;
  onSelectGroup: (groupId: string) => void;
}

export const AccessCodesGradeTabs: React.FC<AccessCodesGradeTabsProps> = ({
  gradeFilter,
  trackFilter,
  selectedGroupId,
  counts,
  totalCodesCount,
  gradeGroups,
  onSelectGrade,
  onSelectTrack,
  onSelectGroup,
}) => {
  return (
    <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200 shadow-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* All Grades Tab */}
        <button
          type="button"
          onClick={() => onSelectGrade('ALL')}
          className={`p-3 rounded-xl text-xs font-black transition flex items-center justify-between cursor-pointer border ${
            gradeFilter === 'ALL'
              ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <KeyRound size={16} className={gradeFilter === 'ALL' ? 'text-white' : 'text-[#0D8A82]'} />
            <span>جميع الصفوف</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
              gradeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {totalCodesCount}
          </span>
        </button>

        {/* 1st Secondary Tab */}
        <button
          type="button"
          onClick={() => onSelectGrade(Grade.FirstSecondary)}
          className={`p-3 rounded-xl text-xs font-black transition flex items-center justify-between cursor-pointer border ${
            gradeFilter === Grade.FirstSecondary
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-sky-50/50 text-sky-800 hover:bg-sky-100/70 border-sky-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap
              size={16}
              className={gradeFilter === Grade.FirstSecondary ? 'text-white' : 'text-sky-600'}
            />
            <span>الصف الأول الثانوي</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
              gradeFilter === Grade.FirstSecondary ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
            }`}
          >
            {counts.firstSec}
          </span>
        </button>

        {/* 2nd Secondary Tab (General & Baccalaureate) */}
        <button
          type="button"
          onClick={() => onSelectGrade(Grade.SecondSecondary)}
          className={`p-3 rounded-xl text-xs font-black transition flex items-center justify-between cursor-pointer border ${
            gradeFilter === Grade.SecondSecondary
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-purple-50/50 text-purple-800 hover:bg-purple-100/70 border-purple-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              className={gradeFilter === Grade.SecondSecondary ? 'text-white' : 'text-purple-600'}
            />
            <span>الصف الثاني الثانوي</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
              gradeFilter === Grade.SecondSecondary
                ? 'bg-white/20 text-white'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {counts.secondSec}
          </span>
        </button>

        {/* 3rd Secondary Tab */}
        <button
          type="button"
          onClick={() => onSelectGrade(Grade.ThirdSecondary)}
          className={`p-3 rounded-xl text-xs font-black transition flex items-center justify-between cursor-pointer border ${
            gradeFilter === Grade.ThirdSecondary
              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
              : 'bg-teal-50/50 text-teal-800 hover:bg-teal-100/70 border-teal-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap
              size={16}
              className={gradeFilter === Grade.ThirdSecondary ? 'text-white' : 'text-teal-600'}
            />
            <span>الصف الثالث الثانوي</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
              gradeFilter === Grade.ThirdSecondary ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
            }`}
          >
            {counts.thirdSec}
          </span>
        </button>
      </div>

      {/* 2nd Secondary Track Filter Bar & Info */}
      {gradeFilter === Grade.SecondSecondary && (
        <div className="mt-3 p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/90 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <Info size={16} className="text-purple-600 shrink-0" />
              <span>
                طلاب الصف الثاني الثانوي - فلترة الأكواد حسب المسار التعليمي:
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectTrack('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  trackFilter === 'ALL'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-white text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                جميع مسارات تانية ({counts.secondSec})
              </button>

              <button
                type="button"
                onClick={() => onSelectTrack(AcademicTrack.General)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  trackFilter === AcademicTrack.General
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-white text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>المسار العام ({counts.secondSecGeneral})</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTrack(AcademicTrack.Baccalaureate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  trackFilter === AcademicTrack.Baccalaureate
                    ? 'bg-fuchsia-700 text-white shadow-2xs'
                    : 'bg-white text-fuchsia-800 hover:bg-fuchsia-100 border border-fuchsia-200'
                }`}
              >
                <Sparkles size={13} className="text-fuchsia-500" />
                <span>مسار البكالوريا ({counts.secondSecBac})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1st & 3rd Secondary Group Filter Bar */}
      {(gradeFilter === Grade.FirstSecondary || gradeFilter === Grade.ThirdSecondary) &&
        gradeGroups.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-slate-700">
              فلترة أكواد سناتر {gradeFilter === Grade.FirstSecondary ? 'أولى ثانوي' : 'تالتة ثانوي'}:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectGroup('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !selectedGroupId
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                كافة مجموعات الصف
              </button>

              {gradeGroups.map((group) => (
                <button
                  key={group._id}
                  type="button"
                  onClick={() => onSelectGroup(group._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedGroupId === group._id
                      ? 'bg-[#0D8A82] text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default AccessCodesGradeTabs;

