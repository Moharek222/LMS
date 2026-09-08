import React from 'react';
import { User, ChevronLeft } from 'lucide-react';

export interface JoinedStudent {
  id: string;
  name: string;
  groupName: string;
  timeAgo: string;
  avatarUrl?: string;
}

interface RecentStudentsWidgetProps {
  students?: JoinedStudent[];
  onViewAll?: () => void;
}

export const RecentStudentsWidget: React.FC<RecentStudentsWidgetProps> = ({
  students = [],
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800">أحدث الطلاب المنضمين</h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-semibold">
              لا يوجد طلاب منضمون حديثاً
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{student.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {student.groupName}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  {student.timeAgo}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-1 text-xs font-bold text-[#0D8A82] hover:text-teal-700 transition cursor-pointer"
        >
          <span>عرض جميع الطلاب</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default RecentStudentsWidget;
