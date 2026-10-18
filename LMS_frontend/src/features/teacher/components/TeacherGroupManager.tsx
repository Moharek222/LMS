import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
} from 'lucide-react';
import { useTeacherGroups } from '../hooks/useTeacherGroups';
import type { Group, GroupStudent } from '../types/groupManagement';
import { GroupCard } from './groups/GroupCard';
import { CreateGroupModal } from './groups/CreateGroupModal';
import { EditGroupModal } from './groups/EditGroupModal';
import { DeactivateGroupModal } from './groups/DeactivateGroupModal';
import { GroupStudentsModal } from './groups/GroupStudentsModal';
import { MoveStudentModal } from './groups/MoveStudentModal';
import { ResetStudentPasswordModal } from './groups/ResetStudentPasswordModal';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

export const TeacherGroupManager: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deactivatingGroup, setDeactivatingGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [viewingStudentsGroup, setViewingStudentsGroup] = useState<Group | null>(null);
  const [movingStudentData, setMovingStudentData] = useState<{
    student: GroupStudent;
    currentGroup: Group;
  } | null>(null);
  const [resettingPasswordStudentData, setResettingPasswordStudentData] = useState<{
    student: GroupStudent;
    currentGroup: Group;
  } | null>(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>('');

  const { data, isLoading, isError, error, refetch } = useTeacherGroups({
    page,
    limit,
  });

  const groups = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!groupSearchQuery.trim()) return groups;
    const q = groupSearchQuery
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');

    return groups.filter((g) => {
      const name = (g.name || '')
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[\u064B-\u065F]/g, '');
      return name.includes(q);
    });
  }, [groups, groupSearchQuery]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-65">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري تحميل المجموعات الدراسية...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل المجموعات</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(error, 'تعذر تحميل المجموعات الدراسية حالياً.')}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-800">المجموعات الدراسية</h3>
              {data?.total !== undefined && (
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
                  إجمالي المجموعات: {totalItems}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              إدارة المجموعات والمواعيد وتنظيم الطلاب بالمنصة
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>إضافة مجموعة جديدة</span>
        </button>
      </div>

      {/* Group Instant Search Bar */}
      {groups.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
              placeholder="ابحث باسم المجموعة أو الموعد (مثال: السبت، أولى ثانوي)..."
              className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] bg-slate-50/70 transition"
            />
            {groupSearchQuery && (
              <button
                type="button"
                onClick={() => setGroupSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="مسح البحث"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {groupSearchQuery && (
            <span className="text-xs font-bold text-[#0D8A82] bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 shrink-0">
              النتائج: {filteredGroups.length} من {groups.length}
            </span>
          )}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <FolderKanban size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800">لا توجد مجموعات دراسية مضافة حتى الآن</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
            قم بإضافة مجموعاتك الدراسية لتنظيم الطلاب ومتابعة الحضور وتوليد أكواد التفعيل.
          </p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
            <Search size={22} />
          </div>
          <h4 className="text-sm font-bold text-slate-700">لا توجد مجموعات مطابقة لبحثك</h4>
          <p className="text-xs text-slate-400">"{groupSearchQuery}"</p>
          <button
            type="button"
            onClick={() => setGroupSearchQuery('')}
            className="text-xs text-[#0D8A82] font-bold hover:underline cursor-pointer"
          >
            مسح البحث وعرض جميع المجموعات ({groups.length})
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onEdit={(g) => setEditingGroup(g)}
              onDeactivate={(id, name) => setDeactivatingGroup({ id, name })}
              onViewStudents={(g) => setViewingStudentsGroup(g)}
            />
          ))}
        </div>
      )}

      
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight size={16} />
            <span>السابق</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            صفحة {page} من {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditGroupModal
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
        group={editingGroup}
      />

      <DeactivateGroupModal
        isOpen={Boolean(deactivatingGroup)}
        onClose={() => setDeactivatingGroup(null)}
        groupId={deactivatingGroup?.id || ''}
        groupName={deactivatingGroup?.name || ''}
      />

      <GroupStudentsModal
        isOpen={Boolean(viewingStudentsGroup)}
        onClose={() => setViewingStudentsGroup(null)}
        group={viewingStudentsGroup}
        onMoveStudent={(student, currentGroup) =>
          setMovingStudentData({ student, currentGroup })
        }
        onResetPassword={(student, currentGroup) =>
          setResettingPasswordStudentData({ student, currentGroup })
        }
      />

      <MoveStudentModal
        isOpen={Boolean(movingStudentData)}
        onClose={() => setMovingStudentData(null)}
        student={movingStudentData?.student || null}
        currentGroup={movingStudentData?.currentGroup || null}
      />

      <ResetStudentPasswordModal
        isOpen={Boolean(resettingPasswordStudentData)}
        onClose={() => setResettingPasswordStudentData(null)}
        student={resettingPasswordStudentData?.student || null}
        groupName={resettingPasswordStudentData?.currentGroup.name}
      />
    </div>
  );
};

export default TeacherGroupManager;
