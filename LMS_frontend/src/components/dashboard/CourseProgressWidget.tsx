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

        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-semibold">
              لا توجد مواد دراسية مضافة حتى الآن
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse?.(course.id)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                
                <div className="flex-1 text-right space-y-1.5">
                  <div className="flex items-center justify-between">
                    {showProgress && (
                      <span className="text-[11px] font-bold text-teal-600">
                        تقدم {course.progress}%
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-slate-800">{course.title}</h4>
                  </div>

                  {showProgress && (
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to from-[#0D8A82] to-teal-400 rounded-full transition-all duration-500"
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseProgressWidget;
