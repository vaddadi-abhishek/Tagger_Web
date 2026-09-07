import React, { useState } from "react";
import type { Bookmark, FacebookCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";

interface FacebookCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

function FacebookImageItem({
  url,
  alt = "Facebook media",
  className = "w-full h-full object-cover",
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const getProxyUrl = (raw?: string | null) => {
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
    return `http://localhost:3000/api/v1/proxy-image?url=${encodeURIComponent(raw)}`;
  };

  const [src, setSrc] = useState<string>(() => getProxyUrl(url));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (src.includes("/proxy-image?url=") && url) {
      setSrc(url);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`bg-slate-100 dark:bg-[#242526] flex items-center justify-center text-slate-400 dark:text-slate-600 ${className}`}>
        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      loading="lazy"
      {...({ referrerPolicy: "no-referrer" } as any)}
      className={className}
    />
  );
}

export function FacebookCard(props: FacebookCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onRequestEdit,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: FacebookCardData | null = React.useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData);
      } catch {
        return null;
      }
    }
    return rawCardData as FacebookCardData;
  }, [rawCardData]);

  const author = cardData?.author || (bookmark as any)?.author;

  const getProxyUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    return `${baseUrl}/proxy-image?url=${encodeURIComponent(url)}`;
  };



  const [avatarSrc, setAvatarSrc] = useState<string>(() =>
    author?.avatar_url ? getProxyUrl(author.avatar_url) : ""
  );
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = () => {
    if (avatarSrc.includes("/proxy-image?url=") && author?.avatar_url) {
      setAvatarSrc(author.avatar_url);
    } else {
      setAvatarError(true);
    }
  };

  // Detect playable video URL for Facebook reels and video posts
  const findVideoUrl = (): string | null => {
    const rawMedia = cardData?.media || (bookmark as any)?.media || (bookmark as any)?.card_data?.media;
    if (Array.isArray(rawMedia)) {
      const v = rawMedia.find(
        (m: any) =>
          m &&
          (m.type === "video" ||
            (typeof m === "string" && (m.includes(".mp4") || m.includes("video"))))
      );
      if (v) {
        return typeof v === "string" ? v : v.url || null;
      }
    }

    if ((cardData as any)?.video_url) return (cardData as any).video_url;
    if ((cardData as any)?.videoUrl) return (cardData as any).videoUrl;
    if ((bookmark as any)?.video_url) return (bookmark as any).video_url;

    if (bookmark.snapshot && /\.mp4(?:\?.*)?$/i.test(bookmark.snapshot)) {
      return bookmark.snapshot;
    }

    return null;
  };

  const videoUrl = findVideoUrl();
  const [videoError, setVideoError] = useState(false);

  const FacebookLikeBadge = () => (
    <div className="w-[18px] h-[18px] rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-sm">
      <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.317.733-.51 1.058-.29.488-.682.996-1.15 1.504a11.144 11.144 0 0 1-.954.914l-.066.057C3.593 7.828 3.25 8.1 3 8.35v6.516c.38.163.85.284 1.417.38 1.135.19 2.658.254 4.583.254h.478c1.378 0 2.548-.823 3.003-2.022l1.39-3.707A2.8 2.8 0 0 0 14 8.78V7.5a2.5 2.5 0 0 0-2.5-2.5H9.72c.117-.728.175-1.507.144-2.316a5.534 5.534 0 0 0-.464-2.122 2.03 2.03 0 0 0-.536-.516zM2 8.5a.5.5 0 0 0-.5.5v5.5a.5.5 0 0 0 .5.5h.5V8.5H2z" />
      </svg>
    </div>
  );

  const FacebookBrandLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1877F2] shrink-0">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  const VerticalMoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5V18" />
    </svg>
  );

  const formatNumber = (num?: number): string | null => {
    if (num === undefined || num === null || num <= 0) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatFacebookDate = (dateString?: string | null): string | null => {
    if (!dateString) return null;
    let s = dateString.trim();
    if (/^\d{3}-\d{2}-\d{2}/.test(s)) {
      s = "2" + s;
    }
    const date = new Date(s);
    if (isNaN(date.getTime())) return dateString;

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${dateStr} at ${timeStr}`;
  };

  const metrics = cardData?.metrics;

  // Extract all valid image URLs from cardData.media or bookmark.snapshot
  const postImages: string[] = (() => {
    const list: string[] = [];
    if (Array.isArray(cardData?.media)) {
      for (const m of cardData.media) {
        if (!m) continue;
        const url = typeof m === "string" ? m : m.url;
        const type = typeof m === "object" ? m.type : "";
        if (url && typeof url === "string" && type !== "video" && !url.includes(".mp4")) {
          if (!list.includes(url)) {
            list.push(url);
          }
        }
      }
    }
    if (list.length === 0 && bookmark.snapshot && !bookmark.snapshot.includes(".mp4")) {
      list.push(bookmark.snapshot);
    }
    return list;
  })();

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    if (postImages.length === 1) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#2f3336] bg-slate-100 dark:bg-black flex items-center justify-center">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block w-full">
            <FacebookImageItem
              url={postImages[0]}
              className="w-full h-auto max-h-[360px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        </div>
      );
    }

    if (postImages.length === 2) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#2f3336] bg-slate-200 dark:bg-[#2f3336]">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="grid grid-cols-2 gap-0.5 w-full h-44 sm:h-52">
            <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[0]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[1]} className="w-full h-full object-cover" />
            </div>
          </a>
        </div>
      );
    }

    if (postImages.length === 3) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#2f3336] bg-slate-200 dark:bg-[#2f3336]">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-48 sm:h-56">
            <div className="row-span-2 col-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[0]} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[1]} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[2]} className="w-full h-full object-cover" />
            </div>
          </a>
        </div>
      );
    }

    if (postImages.length === 4) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#2f3336] bg-slate-200 dark:bg-[#2f3336]">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-48 sm:h-56">
            {postImages.slice(0, 4).map((imgUrl, idx) => (
              <div key={idx} className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
                <FacebookImageItem url={imgUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </a>
        </div>
      );
    }

    // 5 or more images: Classic Facebook 2-on-top, 3-on-bottom layout
    return (
      <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#2f3336] bg-slate-200 dark:bg-[#2f3336]">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="flex flex-col gap-0.5 w-full h-52 sm:h-60">
          {/* Top row: 2 images */}
          <div className="flex flex-row gap-0.5 w-full h-[55%]">
            <div className="relative w-1/2 h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[0]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-1/2 h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[1]} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Bottom row: 3 images */}
          <div className="flex flex-row gap-0.5 w-full h-[45%]">
            <div className="relative w-1/3 h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[2]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-1/3 h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[3]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-1/3 h-full overflow-hidden bg-slate-100 dark:bg-[#242526]">
              <FacebookImageItem url={postImages[4]} className="w-full h-full object-cover" />
              {postImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  +{postImages.length - 4}
                </div>
              )}
            </div>
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18191a] text-slate-900 dark:text-[#e4e6eb] font-sans rounded-2xl border border-slate-200/80 dark:border-[#2f3336] overflow-hidden pb-1 shadow-sm">
      {/* Author Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {!avatarError && avatarSrc ? (
            <img
              src={avatarSrc}
              alt={author?.name || "Facebook User"}
              onError={handleAvatarError}
              className="w-8.5 h-8.5 rounded-full bg-slate-200 dark:bg-[#242526] object-cover shrink-0"
            />
          ) : (
            <div className="w-8.5 h-8.5 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="font-bold text-slate-900 dark:text-[#e4e6eb] text-[13.5px] truncate">{author?.name || "Facebook User"}</span>
            {formatFacebookDate(cardData?.posted_at || bookmark.created_at) && (
              <span className="text-[11px] text-slate-500 dark:text-[#b0b3b8] truncate mt-0.5">
                {formatFacebookDate(cardData?.posted_at || bookmark.created_at)}
              </span>
            )}
          </div>
        </div>

        {/* Top Right: Facebook Brand Logo + Vertical 3 Dots Menu Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <div className="p-0.5 shrink-0">
            <FacebookBrandLogo />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#242526] dark:hover:text-[#e4e6eb] transition-colors cursor-pointer text-slate-500 dark:text-[#b0b3b8] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3a3b3c] shadow-lg z-40 text-[13px] font-medium text-slate-900 dark:text-[#e4e6eb] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEdit?.(bookmark);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
                >
                  Edit bookmark
                </button>
                <hr className="border-slate-200 dark:border-[#3a3b3c] my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete?.(bookmark.id);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[#ff3040] transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Text Body */}
      <div className="px-3.5 pb-2 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e4e6eb]">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={150}
            className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words"
            buttonClassName="ml-1 text-[#1877F2] hover:underline"
          />
        </a>
      </div>

      {/* Media Section: Playable Video for Reels & Videos, or Facebook Multi-Image Grid */}
      {videoUrl && !videoError ? (
        <div className="w-full bg-slate-100 dark:bg-black overflow-hidden border-y border-slate-200 dark:border-[#2f3336] flex items-center justify-center">
          <video
            key={videoUrl}
            controls
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            className="w-full max-h-[360px] object-contain bg-slate-100 dark:bg-black"
            poster={bookmark.snapshot ? getProxyUrl(bookmark.snapshot) : postImages[0] ? getProxyUrl(postImages[0]) : undefined}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        </div>
      ) : videoUrl && videoError ? (
        <div className="w-full p-4 bg-slate-900 border-y border-slate-700 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-[12px] text-slate-300">Video playback unavailable in direct preview</p>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={() => setVideoError(false)}
              className="text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              Retry
            </button>
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2.5 py-1 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium transition cursor-pointer"
            >
              Open Video ↗
            </a>
          </div>
        </div>
      ) : (
        renderImageGrid()
      )}

      {/* Graphic Metrics Row: Like, Comment, and Share icons always displayed; numbers hidden if 0 */}
      <div className="px-3.5 py-2 flex items-center justify-between text-slate-500 dark:text-[#b0b3b8] mt-auto border-t border-slate-100 dark:border-[#2f3336]/40">
        <div className="flex items-center gap-1.5 hover:text-[#1877F2] transition-colors cursor-pointer text-[12px]">
          <FacebookLikeBadge />
          {formatNumber(metrics?.likes) ? (
            <span className="font-normal text-slate-700 dark:text-[#e4e6eb] text-[12px]">
              {formatNumber(metrics?.likes)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3.5 text-[12px]">
          <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#e4e6eb] transition-colors cursor-pointer" title="Comments">
            <CommentIcon />
            {formatNumber(metrics?.comments) ? (
              <span className="font-normal text-slate-700 dark:text-[#e4e6eb]">
                {formatNumber(metrics?.comments)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#e4e6eb] transition-colors cursor-pointer" title="Shares">
            <ShareIcon />
            {formatNumber(metrics?.shares) ? (
              <span className="font-normal text-slate-700 dark:text-[#e4e6eb]">
                {formatNumber(metrics?.shares)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
