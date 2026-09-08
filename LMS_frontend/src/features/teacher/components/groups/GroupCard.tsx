import React from 'react';
import { FolderKanban, Edit, XCircle, Users } from 'lucide-react';
import type { Group } from '../../types/groupManagement';

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDeactivate: (groupId: string, groupName: string) => void;
  onViewStudents?: (group: Group) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onEdit,
  onDeactivate,
  onViewStudents,
}) => {
  const isGroupActive = group.isActive !== false;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0D8A82] flex items-center justify-center font-bold text-xs shrink-0">
          <FolderKanban size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-bold text-slate-800">{group.name}</h5>
            {isGroupActive ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                نشطة
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                متوقفة
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            معرف المجموعة: {group._id}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onViewStudents && (
          <button
            type="button"
            onClick={() => onViewStudents(group)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0D8A82]/10 text-[#0D8A82] hover:bg-[#0D8A82]/20 border border-teal-200/60 text-xs font-bold transition cursor-pointer"
          >
            <Users size={13} />
            <span>الطلاب</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(group)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer"
        >
          <Edit size={13} />
          <span>تعديل</span>
        </button>

        {isGroupActive ? (
          <button
            type="button"
            onClick={() => onDeactivate(group._id, group.name)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 text-xs font-bold transition cursor-pointer"
          >
            <XCircle size={13} />
            <span>إيقاف المجموعة</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed opacity-75"
          >
            المجموعة متوقفة
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
