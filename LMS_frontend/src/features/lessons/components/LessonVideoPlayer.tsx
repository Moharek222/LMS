import React, { useState, useEffect, useRef, useCallback } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
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
  RotateCw,
  PlayCircle,
  Sparkles,
  Gauge,
  Play,
} from 'lucide-react';
import { useLessonVideo } from '../hooks/useLessonVideo';
import { useMarkLessonAsWatched } from '../hooks/useProgress';
import { useAuth } from '../../../context/useAuth';

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

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

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

  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  const videoNodeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const hasAutoRefetchedRef = useRef(false);
  const hasMarkedProgressRef = useRef(false);

  const videoSrc = videoData?.videoUrl;

  // Safely pause video when student leaves window or screen record attempt detected
  const pauseVideoForSecurity = useCallback(() => {
    if (playerRef.current && !playerRef.current.isDisposed() && !playerRef.current.paused()) {
      playerRef.current.pause();
    }
    setIsWindowBlurred(true);
  }, []);

  const resumeVideoFromSecurity = useCallback(() => {
    setIsWindowBlurred(false);
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.play()?.catch(() => {
        // Safe catch for autoplay restrictions
      });
    }
  }, []);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.playbackRate(speed);
    }
    setIsSpeedMenuOpen(false);
  };

  // Keep latest callbacks synchronized in refs for stable video.js event listeners
  const callbackRefs = useRef({ courseId, lessonId, onVideoEnded, refetch });
  useEffect(() => {
    callbackRefs.current = { courseId, lessonId, onVideoEnded, refetch };
  }, [courseId, lessonId, onVideoEnded, refetch]);

  // Reset tracking state on lesson change
  useEffect(() => {
    hasAutoRefetchedRef.current = false;
    hasMarkedProgressRef.current = false;
  }, [lessonId, videoSrc]);

  // Video.js Initialization & Cleanup
  useEffect(() => {
    if (!videoSrc || !videoNodeRef.current) return;

    const host = videoNodeRef.current;
    host.innerHTML = '';

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-fill');
    videoElement.setAttribute('controlsList', 'nodownload noremoteplayback');
    videoElement.setAttribute('disablePictureInPicture', 'true');
    videoElement.setAttribute('playsinline', 'true');
    videoElement.oncontextmenu = (e) => e.preventDefault();
    host.appendChild(videoElement);

    const isHls = videoSrc.includes('.m3u8');
    const player = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: 'metadata',
      fill: true,
      responsive: true,
      playbackRates: [0.75, 1, 1.25, 1.5, 1.75, 2],
      controlBar: {
        pictureInPictureToggle: false,
        skipButtons: { forward: 10, backward: 10 },
      },
      sources: [
        {
          src: videoSrc,
          type: isHls ? 'application/x-mpegURL' : 'video/mp4',
        },
      ],
    });

    playerRef.current = player;

    player.ready(() => {
      if (player.isDisposed()) return;
      player.playbackRate(playbackSpeed);
    });

    player.on('timeupdate', () => {
      if (player.isDisposed()) return;
      const duration = player.duration() || 0;
      const currentTime = player.currentTime() || 0;
      const { courseId: cId, lessonId: lId } = callbackRefs.current;

      if (!duration || hasMarkedProgressRef.current || !cId || !lId) return;

      if (currentTime / duration >= 0.5) {
        hasMarkedProgressRef.current = true;
        markWatchedMutation.mutate({ courseID: cId, lessonID: lId });
      }
    });

    player.on('ended', () => {
      if (player.isDisposed()) return;
      const { courseId: cId, lessonId: lId, onVideoEnded: onEnd } = callbackRefs.current;
      if (!hasMarkedProgressRef.current && cId && lId) {
        hasMarkedProgressRef.current = true;
        markWatchedMutation.mutate({ courseID: cId, lessonID: lId });
      }
      onEnd?.();
    });

    player.on('error', () => {
      if (!hasAutoRefetchedRef.current) {
        hasAutoRefetchedRef.current = true;
        callbackRefs.current.refetch();
      }
    });

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoSrc]);

  // Security keyboard & window focus listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }

      // Block screenshot / developer inspect keys
      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        pauseVideoForSecurity();
      }
    };

    const handleWindowBlur = () => pauseVideoForSecurity();
    const handleVisibilityChange = () => {
      if (document.hidden) pauseVideoForSecurity();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isCinemaMode, pauseVideoForSecurity]);

  if (!lessonId) return null;

  const displayTitle = videoData?.title || lessonTitle || 'مشاهدة الدرس';
  const studentName = user?.name || 'طالب المنصة';
  const studentCode = user?.phone || user?.id?.slice(-6) || 'STD-USER';
  const watermarkText = `🔒 ${studentName} | كود: ${studentCode}`;

  return (
    <div
      className={
        isCinemaMode
          ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4 text-white custom-scrollbar transition-all duration-300'
          : 'bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 transition-all duration-300'
      }
    >
      {/* Header bar */}
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
              <h4 className={`text-base sm:text-lg font-extrabold ${isCinemaMode ? 'text-white' : 'text-slate-800'}`}>
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
          {/* Playback Speed Menu */}
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
                    onClick={() => handleSpeedChange(speed)}
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
            onClick={() => setIsCinemaMode((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isCinemaMode
                ? 'bg-amber-500/90 text-white border-amber-400 hover:bg-amber-600 shadow-sm'
                : 'bg-teal-50 text-[#0D8A82] border-teal-200/80 hover:bg-teal-100'
            }`}
            title={isCinemaMode ? 'إغلاق وضع التركيز (Esc)' : 'تفعيل وضع التركيز السينمائي'}
          >
            {isCinemaMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span className="hidden sm:inline">
              {isCinemaMode ? 'إغلاق وضع التركيز' : 'وضع التركيز السينمائي'}
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
          >
            <span>الدرس التالي</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Video.js Host Container */}
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
            {/* Video.js Root Element */}
            <div ref={videoNodeRef} className="w-full h-full relative" />

            {/* Continuous Floating Watermark */}
            <div className="animate-floating-watermark z-30 pointer-events-none select-none">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-xs border border-white/20 text-white/90 text-xs font-extrabold tracking-wide flex items-center gap-1.5 shadow-lg">
                <Lock size={12} className="text-teal-400 shrink-0" />
                <span>{watermarkText}</span>
              </div>
            </div>

            {/* Subtle Center Watermark for Anti-Crop Defense */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20 overflow-hidden">
              <span className="text-white/10 text-sm sm:text-2xl font-black tracking-widest -rotate-12 whitespace-nowrap">
                {studentName} • {studentCode}
              </span>
            </div>

            {/* Security Blur Overlay */}
            {isWindowBlurred && (
              <div
                onClick={resumeVideoFromSecurity}
                className="absolute inset-0 bg-slate-950/92 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                  <ShieldAlert size={34} />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h5 className="text-sm sm:text-base font-extrabold text-white">
                    تم إيقاف الفيديو مؤقتاً لحماية المحتوى 🔒
                  </h5>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    تم إيقاف التشغيل تلقائياً بسبب مغادرة نافذة الشرح. تسجيل الشاشة محمي بموجب شروط المنصة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeVideoFromSecurity();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D8A82] hover:bg-teal-600 text-white text-xs font-extrabold transition cursor-pointer shadow-lg"
                >
                  <Play size={15} fill="currentColor" />
                  <span>استئناف مشاهدة الدرس</span>
                </button>
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

export default LessonVideoPlayer;
