import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Video,
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useLessonVideo } from '../hooks/useLessonVideo';
import { useAuth } from '../../../context/useAuth';

interface LessonVideoPlayerProps {
  lessonId: string;
  lessonTitle?: string;
  lessonDescription?: string;
  lessonOrder?: number;
  requiresPassing?: boolean;
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onVideoEnded?: () => void;
  isCompletedSession?: boolean;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  lessonId,
  lessonTitle,
  lessonDescription,
  lessonOrder,
  requiresPassing,
  onPreviousLesson,
  onNextLesson,
  hasPrevious = false,
  hasNext = false,
  onVideoEnded,
  isCompletedSession = false,
}) => {
  const { user } = useAuth();
  const { data: videoData, isLoading, isError } = useLessonVideo(lessonId);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [watermarkPosIndex, setWatermarkPosIndex] = useState<number>(0);
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);

  // Student Watermark Identifier
  const studentName = user?.name || 'طالب المنصة';
  const studentCode = user?.phone || user?.id?.slice(-6) || 'STD-USER';
  const watermarkText = `🔒 ${studentName} | كود: ${studentCode}`;

  // 1. Dynamic Watermark Position Interval (moves every 9 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPosIndex((prev) => (prev + 1) % 5);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // 2. Anti-DevTools & Anti-Screen Capture Key Listener & Window Focus Protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }

      // Block F12, PrintScreen, Ctrl+Shift+I, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isCinemaMode]);

  if (!lessonId) {
    return null;
  }

  const displayTitle = videoData?.title || lessonTitle || 'مشاهدة الدرس';
  const videoSrc = videoData?.videoUrl;

  // Watermark Positioning Classes
  const watermarkPositions = [
    'top-4 right-4',
    'bottom-12 left-4',
    'top-4 left-4',
    'bottom-12 right-4',
    'top-1/2 right-6 -translate-y-1/2',
  ];

  return (
    <div
      className={
        isCinemaMode
          ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4 text-white custom-scrollbar transition-all duration-300'
          : 'bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 transition-all duration-300'
      }
    >
      {/* Header Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isCinemaMode ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {lessonOrder !== undefined && (
            <div
              className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 border shadow-xs ${
                isCinemaMode
                  ? 'bg-teal-900/60 text-teal-300 border-teal-700/60'
                  : 'bg-teal-50 text-[#0D8A82] border-teal-100'
              }`}
            >
              {lessonOrder}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-base font-extrabold ${
                  isCinemaMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                {displayTitle}
              </h4>
              {isCompletedSession && (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>تمت المشاهدة</span>
                </span>
              )}
              {requiresPassing && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>يتطلب اجتياز اختبار</span>
                </span>
              )}
            </div>
            <p
              className={`text-xs font-semibold ${
                isCinemaMode ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              الشرح التفاعلي والمحاضرة الدراسية {isCinemaMode && '(وضع التركيز السينمائي)'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          <button
            onClick={() => setIsCinemaMode((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isCinemaMode
                ? 'bg-amber-500/90 text-white border-amber-400 hover:bg-amber-600 shadow-sm'
                : 'bg-teal-50 text-[#0D8A82] border-teal-200 hover:bg-teal-100'
            }`}
            title={isCinemaMode ? 'إغلاق وضع التركيز (Esc)' : 'تفعيل وضع التركيز السينمائي'}
            aria-label={isCinemaMode ? 'إغلاق وضع التركيز' : 'تفعيل وضع التركيز'}
          >
            {isCinemaMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span className="hidden sm:inline">
              {isCinemaMode ? 'إغلاق وضع التركيز' : 'وضع التركيز'}
            </span>
          </button>

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

      {/* Protected Video Container */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className={
          isCinemaMode
            ? 'relative w-full max-w-6xl mx-auto flex-1 min-h-[50vh] max-h-[75vh] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl select-none'
            : 'relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner select-none'
        }
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-2">
            <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-semibold">جاري تجهيز رابط الفيديو والأمان...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-red-400 space-y-2">
            <AlertTriangle size={36} className="text-red-500" />
            <p className="text-xs font-bold text-slate-200">تعذر تحميل رابط الفيديو</p>
            <p className="text-[11px] text-slate-400">يرجى التأكد من صلاحية الاشتراك أو المحاولة لاحقاً</p>
          </div>
        ) : !videoSrc ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <Video size={36} />
            <p className="text-xs font-semibold">رابط الفيديو غير متاح حالياً لهذا الدرس</p>
          </div>
        ) : (
          <>
            <video
              key={videoSrc}
              controls
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              playsInline
              onEnded={onVideoEnded}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-contain pointer-events-auto"
              src={videoSrc}
            >
              متصفحك لا يدعم تشغيل الفيديو المباشر.
            </video>

            {/* Dynamic Floating Watermark Overlay */}
            <div
              className={`absolute transition-all duration-700 ease-in-out pointer-events-none select-none z-30 ${
                watermarkPositions[watermarkPosIndex]
              }`}
            >
              <div className="px-3.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-2xs border border-white/20 text-white/70 text-[11px] font-extrabold tracking-wide flex items-center gap-1.5 shadow-md">
                <Lock size={12} className="text-teal-400 shrink-0" />
                <span>{watermarkText}</span>
              </div>
            </div>

            {/* Window Blur Security Overlay */}
            {isWindowBlurred && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <ShieldAlert size={28} />
                </div>
                <h5 className="text-sm font-extrabold text-white">تم إيقاف العرض لحماية المحتوى 🔒</h5>
                <p className="text-xs text-slate-300 font-semibold max-w-sm">
                  اضغط داخل نافذة الدرس لمتابعة الشرح التفاعلي. تسجيل الشاشة أو مغادرة الشاشة محمي بواسطة إدارة المنصة.
                </p>
              </div>
            )}
          </>
        )}
      </div>

     
      {isCompletedSession && (
        hasNext ? (
          <div
            className={`rounded-2xl p-4 border flex items-center justify-between gap-3 ${
              isCinemaMode
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>رائع! اكتملت مشاهدة هذا الدرس في هذه الجلسة.</span>
            </div>
            <button
              onClick={onNextLesson}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shrink-0 shadow-xs"
            >
              <span>الدرس التالي</span>
              <ChevronLeft size={14} />
            </button>
          </div>
        ) : (
          <div
            className={`rounded-2xl p-4 border flex items-center gap-3 ${
              isCinemaMode
                ? 'bg-teal-950/80 border-teal-800 text-slate-200'
                : 'bg-teal-50/90 border-teal-200 text-slate-800'
            }`}
          >
            <CheckCircle2 size={20} className="text-[#0D8A82] shrink-0" />
            <div>
              <h5 className="text-xs font-bold">أحسنت! أكملت جميع دروس هذا المقرر بنجاح.</h5>
              <p className="text-[11px] text-[#0D8A82] font-extrabold mt-0.5">بالتوفيق.</p>
            </div>
          </div>
        )
      )}

     
      {lessonDescription && (
        <div
          className={`rounded-2xl p-4 border space-y-1 ${
            isCinemaMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200/80 text-slate-600'
          }`}
        >
          <h5
            className={`text-xs font-bold ${
              isCinemaMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            تفاصيل وملاحظات الدرس:
          </h5>
          <p className="text-xs font-medium leading-relaxed">{lessonDescription}</p>
        </div>
      )}
    </div>
  );
};

export default LessonVideoPlayer;
