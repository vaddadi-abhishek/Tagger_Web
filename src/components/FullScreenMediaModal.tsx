import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Hls from "hls.js";
import type { Bookmark } from "../types/bookmark";
import {
  extractMediaDetails,
  formatRelativeDate,
  sanitizeUrl,
  resolveCardType,
} from "../lib/utils";
import {
  XBrandLogo,
  InstagramBrandLogo,
  FacebookBrandLogo,
  RedditBrandLogo,
  LinkedInBrandLogo,
  YouTubeBrandLogo,
  PinterestBrandLogo,
  VerifiedBadge,
  FacebookVerifiedBadge,
} from "./SocialCards/SocialCardIcons";

export interface FullScreenMediaModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  initialIndex?: number;
  onClose: () => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

export const FullScreenMediaModal: React.FC<FullScreenMediaModalProps> = ({
  isOpen,
  bookmark,
  initialIndex = 0,
  onClose,
  onViewAiContext,
  onGenerateAiContext,
  isGeneratingAi = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setIsMenuOpen(false);
      setIsDescriptionExpanded(false);
      setIsPlaying(true);
    }
  }, [isOpen, initialIndex]);

  const mediaItems = useMemo(() => {
    if (!bookmark) return [];
    return extractMediaDetails(bookmark);
  }, [bookmark]);

  const currentItem = mediaItems[activeIndex] || mediaItems[0];
  const isVideo = currentItem?.type === "video";

  // Video playback management and HLS stream support
  useEffect(() => {
    if (!isOpen || !isVideo || !currentItem?.url) return;

    const video = videoRef.current;
    if (!video) return;

    // Destroy existing HLS instance if switching streams
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const src = currentItem.url;
    const isHls = Boolean(
      src.includes(".m3u8") ||
      src.includes("HLSPlaylist") ||
      src.includes("format=m3u8")
    );

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
    } else {
      video.src = src;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, isVideo, currentItem?.url]);

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Keyboard navigation & dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        setIsMenuOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : prev));
        setIsMenuOpen(false);
      } else if (e.key === " " && isVideo) {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mediaItems.length, onClose, isVideo, handleTogglePlay]);

  if (!isOpen || !bookmark || mediaItems.length === 0) {
    return null;
  }

  const cardData = (typeof bookmark.card_data === "object" && bookmark.card_data !== null
    ? bookmark.card_data
    : {}) as Record<string, any>;
  const cardType = resolveCardType(bookmark);
  const author = cardData?.author || null;
  const authorName = author?.name || author?.username || bookmark.site_name || "MindSpace";
  const rawHandle = author?.handle || author?.username;
  const authorHandle = rawHandle
    ? rawHandle.startsWith("@")
      ? rawHandle
      : `@${rawHandle}`
    : null;
  const authorAvatar = author?.avatar_url || bookmark.logo || null;
  const isVerified = Boolean(author?.verified);
  const description = (bookmark.description || bookmark.title || "").trim();

  const renderPlatformLogo = () => {
    switch (cardType) {
      case "x":
        return <XBrandLogo className="w-3.5 h-3.5 fill-white shrink-0" />;
      case "instagram":
        return <InstagramBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "facebook":
        return <FacebookBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "reddit":
        return <RedditBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "linkedin":
        return <LinkedInBrandLogo className="w-3.5 h-3.5 fill-[#0a66c2] shrink-0" />;
      case "youtube":
        return <YouTubeBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "pinterest":
        return <PinterestBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl w-screen h-screen overflow-hidden select-none animate-in fade-in duration-200"
      onClick={(e) => {
        // Clicking outer backdrop background closes modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 1. Fullscreen Media Canvas Stage (Fills 100% of viewport in background) */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              key={currentItem.url}
              poster={currentItem.posterUrl || undefined}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              controls={false}
              onClick={handleTogglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full max-w-full max-h-full object-contain cursor-pointer pointer-events-auto"
            />

            {/* Centered Play Button (Shown when paused) */}
            {!isPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="absolute z-20 size-16 sm:size-20 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl transition-all cursor-pointer pointer-events-auto"
                title="Play"
              >
                <svg viewBox="0 0 24 24" className="size-8 sm:size-10 fill-white translate-x-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={bookmark.title || "Fullscreen media"}
            className="w-full h-full max-w-full max-h-full object-contain select-none shadow-2xl pointer-events-auto"
            loading="eager"
          />
        )}

        {/* Carousel Previous Slide Button (Multi-Slide Only) */}
        {mediaItems.length > 1 && activeIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => Math.max(0, prev - 1));
              setIsMenuOpen(false);
            }}
            className="absolute left-3 sm:left-6 z-25 size-11 sm:size-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-xl active:scale-95 outline-none pointer-events-auto"
            title="Previous (Left Arrow)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-6 -translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Carousel Next Slide Button (Multi-Slide Only) */}
        {mediaItems.length > 1 && activeIndex < mediaItems.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => Math.min(mediaItems.length - 1, prev + 1));
              setIsMenuOpen(false);
            }}
            className="absolute right-3 sm:right-6 z-25 size-11 sm:size-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-xl active:scale-95 outline-none pointer-events-auto"
            title="Next (Right Arrow)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-6 translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* 2. Top Bar Overlay (Floating at absolute top) */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/80 via-black/35 to-transparent">
        {/* Top-Left: Translucent Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-lg outline-none pointer-events-auto"
          title="Close (Esc)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="size-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Multi-Item Slide Index Badge */}
        {mediaItems.length > 1 && (
          <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/15 text-white text-xs font-semibold tracking-wider shadow-md pointer-events-auto">
            {activeIndex + 1} / {mediaItems.length}
          </div>
        )}

        {/* Top-Right: Sound toggle & 3-Dots Action Menu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isVideo && (
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  const newMuted = !videoRef.current.muted;
                  videoRef.current.muted = newMuted;
                  setIsMuted(newMuted);
                }
              }}
              className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-lg outline-none"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-7.5l-4.5 4.5H2.25v6h2.25l4.5 4.5V4.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.5-4.5v16.5l-4.5-4.5H2.25v-7.5h4.5z" />
                </svg>
              )}
            </button>
          )}

          {/* 3-Dots Action Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-lg outline-none"
              title="Options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </button>

            {/* Floating Action Menu Dropdown */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#1C1917]/95 border border-white/15 shadow-2xl backdrop-blur-xl py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* 1. View AI Context OR Generate AI Context */}
                  {bookmark.ai_status === "completed" || bookmark.ai_context ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onViewAiContext?.(bookmark);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-white hover:bg-white/10 active:bg-white/15 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="size-4.5 text-amber-400 shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                        />
                      </svg>
                      <span>View AI Context</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onGenerateAiContext?.(bookmark);
                      }}
                      disabled={isGeneratingAi}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-white/10 active:bg-white/15 flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAi ? (
                        <svg
                          className="animate-spin size-4.5 shrink-0 text-amber-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.8"
                          stroke="currentColor"
                          className="size-4.5 text-amber-400 shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                          />
                        </svg>
                      )}
                      <span>{isGeneratingAi ? "Generating AI..." : "Generate AI Context"}</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-white/10" />

                  {/* 2. Open Original Post */}
                  <a
                    href={sanitizeUrl(bookmark.url)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="size-4.5 text-slate-400 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                    <span>Open Original Post</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Description & Author Reels Overlay (Floating at absolute bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pt-16 pb-6 px-4 sm:px-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5 pointer-events-none">
          {/* Author Header Row */}
          <div className="flex items-center gap-2.5 pointer-events-auto">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="size-9 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
              />
            ) : (
              <div className="size-9 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-white/20">
                {(authorName || "M")[0].toUpperCase()}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-white text-[13.5px] sm:text-sm truncate">
                  {authorName}
                </span>
                {isVerified && (
                  cardType === "facebook" ? <FacebookVerifiedBadge className="size-3.5 shrink-0" /> : <VerifiedBadge className="size-3.5 shrink-0" />
                )}
                {renderPlatformLogo()}
              </div>
              {authorHandle && (
                <span className="text-[11.5px] text-white/70 truncate">
                  {authorHandle}
                  {cardData?.posted_at ? ` · ${formatRelativeDate(cardData.posted_at)}` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Caption / Description Container */}
          {description ? (
            <div className="flex flex-col gap-1 pointer-events-auto text-[13px] sm:text-[13.5px]">
              <div
                className={
                  isDescriptionExpanded
                    ? "max-h-[35vh] sm:max-h-[40vh] overflow-y-auto overscroll-contain pr-2 text-white/95 leading-relaxed custom-modal-scrollbar"
                    : "line-clamp-2 text-white/95 leading-relaxed"
                }
              >
                <p className="whitespace-pre-line">{description}</p>
              </div>
              {description.length > 120 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded((prev) => !prev);
                  }}
                  className="self-start text-xs font-semibold text-white/75 hover:text-white transition-colors cursor-pointer py-0.5 outline-none"
                >
                  {isDescriptionExpanded ? "Show less" : "...more"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
