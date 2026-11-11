import React, { useState, useEffect, useRef, useCallback } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
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
  Play,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoNodeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const playbackSpeedRef = useRef<number>(1);
  const hasAutoRefetchedRef = useRef(false);
  const hasMarkedProgressRef = useRef(false);

  const videoSrc = videoData?.videoUrl;

  const handleToggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          setIsCinemaMode(true);
        });
      } else {
        setIsCinemaMode((prev) => !prev);
      }
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

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
        // Ignore autoplay restriction errors
      });
    }
  }, []);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.playbackRate(speed);
    }
  };

  // Keep latest callbacks synchronized in refs for stable video.js event listeners
  const callbackRefs = useRef({
    courseId,
    lessonId,
    onVideoEnded,
    refetch,
    markWatched: markWatchedMutation.mutate,
  });
  useEffect(() => {
    callbackRefs.current = {
      courseId,
      lessonId,
      onVideoEnded,
      refetch,
      markWatched: markWatchedMutation.mutate,
    };
  }, [courseId, lessonId, onVideoEnded, refetch, markWatchedMutation.mutate]);

  // Reset tracking state on lesson/source change
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
      userActions: {
        doubleClick: false,
        hotkeys: false,
      },
      sources: [
        {
          src: videoSrc,
          type: isHls ? 'application/x-mpegURL' : 'video/mp4',
        },
      ],
    });

    // Redirect video.js fullscreen methods (bottom-right button, double-click, etc.)
    // to the parent container so floating & center watermarks remain visible in fullscreen.
    player.isFullscreen = () =>
      Boolean(
        playerContainerRef.current &&
          document.fullscreenElement === playerContainerRef.current
      );

    player.requestFullscreen = () => {
      const container = playerContainerRef.current;
      if (container?.requestFullscreen) {
        return container.requestFullscreen().catch(() => {
          setIsCinemaMode(true);
        });
      }
      setIsCinemaMode(true);
      return Promise.resolve();
    };

    player.exitFullscreen = () => {
      if (document.fullscreenElement) {
        return document.exitFullscreen?.().catch(() => {}) ?? Promise.resolve();
      }
      setIsCinemaMode(false);
      return Promise.resolve();
    };

    playerRef.current = player;

    player.ready(() => {
      if (player.isDisposed()) return;
      player.playbackRate(playbackSpeedRef.current);
    });

    player.on('timeupdate', () => {
      if (player.isDisposed()) return;
      const duration = player.duration() || 0;
      const currentTime = player.currentTime() || 0;
      const { courseId: cId, lessonId: lId, markWatched } = callbackRefs.current;

      if (!duration || hasMarkedProgressRef.current || !cId || !lId) return;

      if (currentTime / duration >= 0.5) {
        hasMarkedProgressRef.current = true;
        markWatched({ courseID: cId, lessonID: lId });
      }
    });

    player.on('ended', () => {
      if (player.isDisposed()) return;
      const { courseId: cId, lessonId: lId, onVideoEnded: onEnd, markWatched } = callbackRefs.current;
      if (!hasMarkedProgressRef.current && cId && lId) {
        hasMarkedProgressRef.current = true;
        markWatched({ courseID: cId, lessonID: lId });
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

  // Security keyboard & tab visibility listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }

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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseVideoForSecurity();
      }
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = Boolean(
        playerContainerRef.current &&
          document.fullscreenElement === playerContainerRef.current
      );
      setIsFullscreen(isNowFullscreen);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.trigger('fullscreenchange');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
      <LessonVideoHeaderBar
        lessonOrder={lessonOrder}
        displayTitle={displayTitle}
        isCompletedSession={isCompletedSession}
        requiresPassing={requiresPassing}
        isCinemaMode={isCinemaMode}
        onToggleCinemaMode={() => setIsCinemaMode((prev) => !prev)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPreviousLesson={onPreviousLesson}
        onNextLesson={onNextLesson}
      />

      {/* Video.js Host Container */}
      <div
        ref={playerContainerRef}
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => {
          if (
            e.target instanceof Element &&
            e.target.closest('.vjs-control-bar, button')
          ) {
            return;
          }
          handleToggleFullscreen();
        }}
        className={
          isFullscreen
            ? 'relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden'
            : isCinemaMode
            ? 'relative w-full max-w-6xl mx-auto flex-1 min-h-[55vh] max-h-[78vh] bg-black rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl select-none'
            : 'relative w-full aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 flex items-center justify-center shadow-md select-none'
        }
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-3">
            <Loader2 size={38} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-bold text-slate-300">جاري تجهيز مشغل الفيديو...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-red-400 space-y-2 max-w-sm">
            <AlertTriangle size={38} className="text-red-500" />
            <p className="text-xs font-bold text-slate-200">تعذر تحميل الفيديو حالياً</p>
            <p className="text-[11px] text-slate-400">تأكد من صلاحية اشتراكك أو أعد المحاولة</p>
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

            {/* Subtle Center Watermark */}
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
                    تم إيقاف التشغيل تلقائياً بسبب مغادرة تبويب الشرح. تسجيل الشاشة محمي بموجب شروط المنصة.
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
              <span>رائع! اكتملت مشاهدة هذا الدرس بنجاح. يمكنك الانتقال للدرس التالي.</span>
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
