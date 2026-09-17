import React from 'react';
import { Plus } from 'lucide-react';

export interface CourseItem {
  id: string;
  title: string;
  level: string;
  studentCount: number;
  progress: number;
  imageUrl: string;
}

interface CourseProgressWidgetProps {
  courses?: CourseItem[];
  title?: string;
  showAddButton?: boolean;
  showStudentCount?: boolean;
  showProgress?: boolean;
  onAddCourse?: () => void;
  onViewAll?: () => void;
  onSelectCourse?: (courseId: string) => void;
}

export const CourseProgressWidget: React.FC<CourseProgressWidgetProps> = ({
  courses = [],
  title = 'المقررات الخاصة بك',
  showAddButton = true,
  showStudentCount = true,
  showProgress = true,
  onAddCourse,
  onViewAll,
  onSelectCourse,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2">
            {onAddCourse && showAddButton && (
              <button
                onClick={onAddCourse}
                className="p-1 rounded-lg bg-teal-50 text-[#0D8A82] hover:bg-teal-100 transition cursor-pointer"
                title="إضافة مقرر جديد"
              >
                <Plus size={18} />
              </button>
            )}
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-bold text-slate-400 hover:text-[#0D8A82] transition cursor-pointer"
              >
                عرض الكل
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {courses.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-semibold">
              لا توجد مواد دراسية مضافة حتى الآن
            </div>
          ) : (
            courses.map((course) => {
              const radius = 14;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (course.progress / 100) * circumference;
              const remainingProgress = 100 - course.progress;

              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse?.(course.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-teal-50/40 border border-slate-100 hover:border-teal-200 transition cursor-pointer group"
                >
                  {/* Progress Ring Icon */}
                  {showProgress && (
                    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-slate-200"
                          fill="transparent"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="text-[#0D8A82] transition-all duration-700 ease-out"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black text-slate-700 group-hover:text-[#0D8A82] transition">
                        {course.progress}%
                      </span>
                    </div>
                  )}

                  <div className="flex-1 text-right space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#0D8A82] transition">
                        {course.title}
                      </h4>
                      {showProgress && (
                        <span className="text-[10px] font-bold text-slate-400">
                          متبقي {remainingProgress}%
                        </span>
                      )}
                    </div>

                    {showProgress && (
                      <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#0D8A82] to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      {showStudentCount && <span>{course.studentCount} طالب</span>}
                      <span>{course.level}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseProgressWidget;
