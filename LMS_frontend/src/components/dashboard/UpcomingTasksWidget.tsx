import React from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';

export interface TaskItem {
  id: string;
  day: string;
  month: string;
  title: string;
  subtitle: string;
  color?: 'teal' | 'blue' | 'purple' | 'amber';
}

interface UpcomingTasksWidgetProps {
  tasks?: TaskItem[];
  onViewAll?: () => void;
}

export const defaultTasks: TaskItem[] = [
  {
    id: '1',
    day: '25',
    month: 'مايو',
    title: 'اختبار الفصل الأول',
    subtitle: 'الكيمياء العضوية - المجموعة 1',
    color: 'teal',
  },
  {
    id: '2',
    day: '28',
    month: 'مايو',
    title: 'واجب تفاعلي',
    subtitle: 'الكيمياء غير العضوية - المجموعة 2',
    color: 'blue',
  },
  {
    id: '3',
    day: '30',
    month: 'مايو',
    title: 'تصحيح اختبارات',
    subtitle: 'الكيمياء التحليلية - المجموعة 3',
    color: 'purple',
  },
  {
    id: '4',
    day: '02',
    month: 'يونيو',
    title: 'شرح الدرس القادم',
    subtitle: 'الاتزان الكيميائي',
    color: 'teal',
  },
];

export const UpcomingTasksWidget: React.FC<UpcomingTasksWidgetProps> = ({
  tasks = defaultTasks,
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#0D8A82]" />
            <h3 className="text-sm font-extrabold text-slate-800">المهام القادمة</h3>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="text-right">
                <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  {task.subtitle}
                </p>
              </div>

              
              <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black text-[#0D8A82] leading-none">
                  {task.day}
                </span>
                <span className="text-[9px] font-bold text-teal-600 mt-0.5 leading-none">
                  {task.month}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-1 text-xs font-bold text-[#0D8A82] hover:text-teal-700 transition cursor-pointer"
        >
          <span>عرض جميع المهام</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default UpcomingTasksWidget;
