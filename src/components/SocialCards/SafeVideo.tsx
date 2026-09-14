import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface SafeVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'poster'> {
  src: string;
  poster?: string | null;
  className?: string;
  controls?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
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
  ...rest
}: SafeVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHls =
      src.includes(".m3u8") ||
      src.includes("HLSPlaylist") ||
      src.includes("format=m3u8");

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
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari iOS / macOS)
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster || undefined}
      controls={controls}
      playsInline={playsInline}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      className={className}
      {...rest}
    />
  );
});
