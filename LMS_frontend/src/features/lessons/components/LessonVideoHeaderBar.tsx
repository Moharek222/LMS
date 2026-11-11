import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Maximize,
  Minimize,
  Sparkles,
  Gauge,
} from 'lucide-react';

interface LessonVideoHeaderBarProps {
  lessonOrder?: number;
  displayTitle: string;
  isCompletedSession: boolean;
  requiresPassing?: boolean;
  isCinemaMode: boolean;
  onToggleCinemaMode: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export const LessonVideoHeaderBar: React.FC<LessonVideoHeaderBarProps> = ({
  lessonOrder,
  displayTitle,
  isCompletedSession,
  requiresPassing,
  isCinemaMode,
  onToggleCinemaMode,
  isFullscreen = false,
  onToggleFullscreen,
  playbackSpeed,
  onSpeedChange,
  hasPrevious,
  hasNext,
  onPreviousLesson,
  onNextLesson,
}) => {
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);

  const handleSelectSpeed = (speed: number) => {
    onSpeedChange(speed);
    setIsSpeedMenuOpen(false);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
        isCinemaMode ? 'border-slate-800' : 'border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3.5">
        {lessonOrder !== undefined && (
          <div
            className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 border shadow-xs ${
              isCinemaMode
                ? 'bg-teal-950/80 text-teal-300 border-teal-700/60'
                : 'bg-teal-50 text-[#0D8A82] border-teal-100'
            }`}
          >
            {lessonOrder}
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-base sm:text-lg font-extrabold ${
                isCinemaMode ? 'text-white' : 'text-slate-800'
              }`}
            >
              {displayTitle}
            </h4>
            {isCompletedSession && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 size={12} />
                <span>تمت المشاهدة</span>
              </span>
            )}
            {requiresPassing && (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1 shadow-2xs">
                <Sparkles size={12} className="text-amber-500" />
                <span>يتطلب اجتياز اختبار</span>
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-400">
            الشرح التفاعلي للمحاضرة {isCinemaMode && '• وضع التركيز السينمائي'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isCinemaMode
                ? 'bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-700'
                : 'bg-teal-50 text-[#0D8A82] border-teal-200/80 hover:bg-teal-100'
            }`}
            title="سرعة تشغيل الفيديو"
          >
            <Gauge size={15} />
            <span>السرعة: {playbackSpeed}x</span>
          </button>

          {isSpeedMenuOpen && (
            <div
              className={`absolute left-0 mt-1.5 w-28 rounded-2xl shadow-xl border p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in duration-150 ${
                isCinemaMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                سرعة التشغيل
              </div>
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => handleSelectSpeed(speed)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-[#0D8A82] text-white'
                      : isCinemaMode
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-teal-50 text-slate-700'
                  }`}
                >
                  <span>{speed === 1 ? '1x (عادي)' : `${speed}x`}</span>
                  {playbackSpeed === speed && <CheckCircle2 size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCinemaMode}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
            isCinemaMode
              ? 'bg-amber-500/90 text-white border-amber-400 hover:bg-amber-600 shadow-sm'
              : 'bg-teal-50 text-[#0D8A82] border-teal-200/80 hover:bg-teal-100'
          }`}
          title={isCinemaMode ? 'إغلاق وضع التركيز (Esc)' : 'تفعيل وضع التركيز السينمائي'}
          aria-label={isCinemaMode ? 'إغلاق وضع التركيز' : 'تفعيل وضع التركيز'}
        >
          {isCinemaMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span className="hidden sm:inline">
            {isCinemaMode ? 'إغلاق وضع التركيز' : 'وضع التركيز السينمائي'}
          </span>
        </button>

        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isCinemaMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة مع العلامة المائية'}
            aria-label={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span className="hidden md:inline">{isFullscreen ? 'إنهاء التكبير' : 'ملء الشاشة'}</span>
          </button>
        )}

        <button
          onClick={onPreviousLesson}
          disabled={!hasPrevious}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
            hasPrevious
              ? isCinemaMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 cursor-pointer'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 cursor-pointer'
              : isCinemaMode
              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
          }`}
          title="الدرس السابق"
          aria-label="الدرس السابق"
        >
          <ChevronRight size={16} />
          <span>الدرس السابق</span>
        </button>

        <button
          onClick={onNextLesson}
          disabled={!hasNext}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition border ${
            hasNext
              ? 'bg-[#0D8A82] text-white border-[#0D8A82] hover:bg-teal-700 cursor-pointer shadow-xs'
              : isCinemaMode
              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
          }`}
          title="الدرس التالي"
          aria-label="الدرس التالي"
        >
          <span>الدرس التالي</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
};

