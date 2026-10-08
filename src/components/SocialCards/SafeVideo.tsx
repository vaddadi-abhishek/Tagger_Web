import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { SafeImage } from "./SafeImage";

interface SafeVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'poster'> {
  src: string;
  poster?: string | null;
  className?: string;
  controls?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlayStart?: () => void;
}

export const SafeVideo = React.memo(function SafeVideo({
  src,
  poster,
  className = "w-full max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black",
  controls = true,
  playsInline = true,
  autoPlay = false,
  muted = false,
  loop = false,
  onPlayStart,
  ...rest
}: SafeVideoProps) {
  // Poster Facade: only initialize heavy <video> and network stream when user clicks Play
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isHls = Boolean(
    src &&
      (src.includes(".m3u8") ||
        src.includes("HLSPlaylist") ||
        src.includes("format=m3u8"))
  );

  useEffect(() => {
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (!isPlaying) return;

    const video = videoRef.current;
    if (!video || !src) return;

    let hlsInstance: Hls | null = null;

    if (isHls) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            // Autoplay might require user interaction which we already have via click
          });
        });

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hlsInstance?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hlsInstance?.recoverMediaError();
                break;
              default:
                hlsInstance?.destroy();
                setHasError(true);
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari iOS / macOS)
        video.src = src;
        video.play().catch(() => {});
      }
    } else {
      if (!video.src) {
        video.src = src;
      }
      video.play().catch((err) => {
        // Autoplay may be restricted by browser policy; user can click native play control
        console.debug("Video autoplay unmuted prevented:", err);
      });
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [isPlaying, src, isHls]);

  const handleStartPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(true);
    onPlayStart?.();
  };

  // 1. Poster Facade (Lightweight, 0 network video overhead until interaction)
  if (!isPlaying) {
    return (
      <div
        onClick={handleStartPlay}
        className="relative w-full bg-slate-100 dark:bg-black overflow-hidden group/facade cursor-pointer select-none"
        title="Click to play video"
      >
        {poster ? (
          <SafeImage
            url={poster}
            alt="Video thumbnail"
            className={className}
          />
        ) : (
          <div className="w-full h-48 sm:h-56 flex items-center justify-center bg-slate-200/60 dark:bg-zinc-900">
            <svg
              viewBox="0 0 24 24"
              className="size-10 text-slate-400 dark:text-zinc-600 fill-current"
            >
              <path d="M4 6.47v11.06c0 1.05 1.15 1.7 2.05 1.17l8.55-5.53a1.38 1.38 0 0 0 0-2.34L6.05 5.3A1.38 1.38 0 0 0 4 6.47z" />
            </svg>
          </div>
        )}

        {/* Central Play Badge Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover/facade:bg-black/30 transition-colors">
          <div className="size-13 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white border border-white/25 flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover/facade:scale-110 group-hover/facade:border-white/50">
            <svg viewBox="0 0 24 24" className="size-6 fill-white translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Bottom-left subtle Video Indicator */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-semibold text-white/95 flex items-center gap-1 pointer-events-none shadow-xs">
          <svg viewBox="0 0 24 24" className="size-3 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Video</span>
        </div>
      </div>
    );
  }

  // 2. Error Fallback state
  if (hasError) {
    return (
      <div className={`relative w-full bg-slate-100 dark:bg-black overflow-hidden flex flex-col items-center justify-center p-6 text-center ${className}`}>
        {poster && (
          <SafeImage
            url={poster}
            alt="Video preview"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-2 max-w-xs">
          <svg className="size-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-slate-600 dark:text-zinc-400">Media stream unavailable or expired.</p>
          <button
            onClick={() => {
              setHasError(false);
              setIsPlaying(false);
            }}
            className="text-xs px-3 py-1 rounded bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Video Player (Mounted on demand after click)
  return (
    <video
      ref={videoRef}
      src={isHls ? undefined : src}
      poster={poster || undefined}
      controls={controls}
      playsInline={playsInline}
      autoPlay={true}
      muted={muted}
      loop={loop}
      {...({ referrerPolicy: "no-referrer" } as any)}
      preload="metadata"
      onError={(e) => {
        console.warn("Video failed to play:", src, e);
        setHasError(true);
      }}
      className={className}
      {...rest}
    />
  );
});
