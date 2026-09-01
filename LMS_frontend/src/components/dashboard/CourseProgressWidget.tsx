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
  onAddCourse?: () => void;
  onViewAll?: () => void;
  onSelectCourse?: (courseId: string) => void;
}

export const defaultCourses: CourseItem[] = [
  {
    id: '1',
    title: 'الكيمياء العضوية',
    level: 'الصف الثالث الثانوي',
    studentCount: 45,
    progress: 65,
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '2',
    title: 'الكيمياء غير العضوية',
    level: 'الصف الثاني الثانوي',
    studentCount: 38,
    progress: 40,
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '3',
    title: 'الكيمياء التحليلية',
    level: 'الصف الثالث الثانوي',
    studentCount: 28,
    progress: 70,
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=200',
  },
];

export const CourseProgressWidget: React.FC<CourseProgressWidgetProps> = ({
  courses = defaultCourses,
  onAddCourse,
  onViewAll,
  onSelectCourse,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800">المقررات الخاصة بك</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddCourse}
              className="p-1 rounded-lg bg-teal-50 text-[#0D8A82] hover:bg-teal-100 transition cursor-pointer"
              title="إضافة مقرر جديد"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-slate-400 hover:text-[#0D8A82] transition"
            >
              عرض الكل
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse?.(course.id)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              
              <div className="flex-1 text-right space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-600">
                    تقدم {course.progress}%
                  </span>
                  <h4 className="text-xs font-bold text-slate-800">{course.title}</h4>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0D8A82] to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>{course.studentCount} طالب</span>
                  <span>{course.level}</span>
                </div>
              </div>

             
              <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-slate-200 shadow-xs relative">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/30"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseProgressWidget;
