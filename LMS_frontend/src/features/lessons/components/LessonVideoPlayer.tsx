import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Video,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  ShieldAlert,
  Lock,
  RotateCw,
  PlayCircle,
} from 'lucide-react';
import { useLessonVideo } from '../hooks/useLessonVideo';
import { useMarkLessonAsWatched } from '../hooks/useProgress';
import { useAuth } from '../../../context/useAuth';
import { LessonVideoHeaderBar } from './LessonVideoHeaderBar';

interface LessonVideoPlayerProps {
  lessonId: string;
  courseId?: string;
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

const WATERMARK_POSITIONS = [
  'top-4 right-4',
  'bottom-12 left-4',
  'top-4 left-4',
  'bottom-12 right-4',
  'top-1/2 right-6 -translate-y-1/2',
];

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  lessonId,
  courseId,
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
  const { data: videoData, isLoading, isError, refetch, isFetching } = useLessonVideo(lessonId);
  const markWatchedMutation = useMarkLessonAsWatched();

  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [watermarkPosIndex, setWatermarkPosIndex] = useState<number>(0);
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const hasAutoRefetchedRef = useRef<boolean>(false);
  const hasMarkedProgressRef = useRef<boolean>(false);

  const videoSrc = videoData?.videoUrl;

  useEffect(() => {
    hasAutoRefetchedRef.current = false;
    hasMarkedProgressRef.current = false;
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [lessonId, videoSrc, playbackSpeed]);

  const handleVideoError = () => {
    if (!hasAutoRefetchedRef.current) {
      hasAutoRefetchedRef.current = true;
      refetch();
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!video.duration || hasMarkedProgressRef.current || !courseId || !lessonId) return;

    const progressRatio = video.currentTime / video.duration;
    if (progressRatio >= 0.5) {
      hasMarkedProgressRef.current = true;
      markWatchedMutation.mutate({ courseID: courseId, lessonID: lessonId });
    }
  };

  const handleEnded = () => {
    if (!hasMarkedProgressRef.current && courseId && lessonId) {
      hasMarkedProgressRef.current = true;
      markWatchedMutation.mutate({ courseID: courseId, lessonID: lessonId });
    }
    onVideoEnded?.();
  };

  const studentName = user?.name || 'طالب المنصة';
  const studentCode = user?.phone || user?.id?.slice(-6) || 'STD-USER';
  const watermarkText = `🔒 ${studentName} | كود: ${studentCode}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPosIndex((prev) => (prev + 1) % 5);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }

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

    const handleWindowBlur = () => setIsWindowBlurred(true);
    const handleWindowFocus = () => setIsWindowBlurred(false);

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

  return (
    <div
      className={
        isCinemaMode
          ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4 text-white custom-scrollbar transition-all duration-300'
          : 'bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 transition-all duration-300'
      }
    >
      <LessonVideoHeaderBar
        lessonOrder={lessonOrder}
        displayTitle={displayTitle}
        isCompletedSession={isCompletedSession}
        requiresPassing={requiresPassing}
        isCinemaMode={isCinemaMode}
        onToggleCinemaMode={() => setIsCinemaMode((prev) => !prev)}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPreviousLesson={onPreviousLesson}
        onNextLesson={onNextLesson}
      />

      {/* Video Container */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className={
          isCinemaMode
            ? 'relative w-full max-w-6xl mx-auto flex-1 min-h-[55vh] max-h-[78vh] bg-black rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl select-none'
            : 'relative w-full aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 flex items-center justify-center shadow-md select-none'
        }
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-3">
            <Loader2 size={38} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-bold text-slate-300">جاري تجهيز مشغل الفيديو والأمان...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-red-400 space-y-2 max-w-sm">
            <AlertTriangle size={38} className="text-red-500" />
            <p className="text-xs font-bold text-slate-200">تعذر تحميل الفيديو حالياً</p>
            <p className="text-[11px] text-slate-400">تأكد من صلاحية اشتراكك أو جرب الإنعاش</p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : !videoSrc ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <Video size={40} className="text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">رابط الشرح غير متوفر لهذا الدرس</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              key={videoSrc}
              controls
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={handleVideoError}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-contain pointer-events-auto"
              src={videoSrc}
            >
              متصفحك لا يدعم تشغيل الفيديو المباشر.
            </video>

            {/* Dynamic Watermark */}
            <div
              className={`absolute transition-all duration-700 ease-in-out pointer-events-none select-none z-30 ${
                WATERMARK_POSITIONS[watermarkPosIndex]
              }`}
            >
              <div className="px-3.5 py-1.5 rounded-xl bg-black/45 backdrop-blur-xs border border-white/20 text-white/80 text-[11px] font-extrabold tracking-wide flex items-center gap-1.5 shadow-lg">
                <Lock size={12} className="text-teal-400 shrink-0" />
                <span>{watermarkText}</span>
              </div>
            </div>

            {/* Security Blur Overlay */}
            {isWindowBlurred && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                  <ShieldAlert size={30} />
                </div>
                <h5 className="text-sm font-extrabold text-white">تم إيقاف العرض لحماية المحتوى 🔒</h5>
                <p className="text-xs text-slate-300 font-semibold max-w-sm leading-relaxed">
                  اضغط داخل نافذة الشرح لمتابعة الدرس. تسجيل الشاشة ومغادرة الصفحة محمي بموجب شروط المنصة.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Completion Banner */}
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
              <span>رائع! اكتملت مشاهدة هذا الدرس بنجاح. يمكنك للانتقال للدرس التالي.</span>
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
              <p className="text-[11px] text-[#0D8A82] font-extrabold mt-0.5">مبارك لك هذا الإنجاز.</p>
            </div>
          </div>
        )
      )}

      {/* Description */}
      {lessonDescription && (
        <div
          className={`rounded-2xl p-4 border space-y-1.5 ${
            isCinemaMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-slate-50/80 border-slate-200/80 text-slate-600'
          }`}
        >
          <h5
            className={`text-xs font-extrabold flex items-center gap-1.5 ${
              isCinemaMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            <PlayCircle size={14} className="text-[#0D8A82]" />
            <span>تفاصيل وملاحظات الدرس:</span>
          </h5>
          <p className="text-xs font-medium leading-relaxed">{lessonDescription}</p>
        </div>
      )}
    </div>
  );
};
