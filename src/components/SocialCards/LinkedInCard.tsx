import React, { useState } from "react";
import type { Bookmark, LinkedInCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";

interface LinkedInCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

function LinkedInImageItem({
  url,
  alt = "LinkedIn media",
  className = "w-full h-full object-cover",
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`bg-slate-100 dark:bg-[#28323d] flex items-center justify-center text-slate-400 dark:text-slate-600 ${className}`}>
        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      {...({ referrerPolicy: "no-referrer" } as any)}
      className={className}
    />
  );
}

export function LinkedInCard(props: LinkedInCardProps) {
  const {
    bookmark,
    onToggleMenu,
    isMenuOpen,
    onRequestEdit,
    onRequestDelete,
    onCloseMenu,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: LinkedInCardData | null = React.useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData);
      } catch {
        return null;
      }
    }
    return rawCardData as LinkedInCardData;
  }, [rawCardData]);

  const author = cardData?.author || (bookmark as any)?.author;
  const metrics = cardData?.metrics || (bookmark as any)?.metrics;

  const [avatarError, setAvatarError] = useState(false);

  // Extract all valid image URLs from cardData.media or bookmark.snapshot
  const postImages: string[] = React.useMemo(() => {
    const list: string[] = [];
    const media = cardData?.media || (bookmark as any)?.media || (bookmark as any)?.card_data?.media;
    if (Array.isArray(media)) {
      for (const m of media) {
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
  }, [cardData, bookmark]);

  // Find video URL if available
  const videoUrl: string | null = React.useMemo(() => {
    const media = cardData?.media || (bookmark as any)?.media || (bookmark as any)?.card_data?.media;
    if (Array.isArray(media)) {
      const v = media.find(
        (m: any) =>
          m &&
          (m.type === "video" ||
            (typeof m === "string" && (m.includes(".mp4") || m.includes("video"))))
      );
      if (v) {
        return typeof v === "string" ? v : v.url || null;
      }
    }
    if (bookmark.snapshot && /\.mp4(?:\?.*)?$/i.test(bookmark.snapshot)) {
      return bookmark.snapshot;
    }
    return null;
  }, [cardData, bookmark]);

  const [videoError, setVideoError] = useState(false);

  const LinkedInLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-[#0a66c2]">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
    </svg>
  );

  const LikeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );

  const CommentIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );

  const RepostIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );

  const SendIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );

  const VerticalMoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    if (postImages.length === 1) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-100 dark:bg-black flex items-center justify-center">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block w-full">
            <LinkedInImageItem
              url={postImages[0]}
              className="w-full h-auto max-h-[360px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        </div>
      );
    }

    if (postImages.length === 2) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-200 dark:bg-[#28323d]">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="grid grid-cols-2 gap-0.5 w-full h-44 sm:h-52">
            <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[0]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[1]} className="w-full h-full object-cover" />
            </div>
          </a>
        </div>
      );
    }

    if (postImages.length === 3) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-200 dark:bg-[#28323d]">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-48 sm:h-56">
            <div className="row-span-2 col-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[0]} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[1]} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[2]} className="w-full h-full object-cover" />
            </div>
          </a>
        </div>
      );
    }

    if (postImages.length === 4) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-200 dark:bg-[#28323d]">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-48 sm:h-56">
            {postImages.slice(0, 4).map((imgUrl, idx) => (
              <div key={idx} className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
                <LinkedInImageItem url={imgUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </a>
        </div>
      );
    }

    // 5 or more images
    return (
      <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-200 dark:bg-[#28323d]">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="flex flex-col gap-0.5 w-full h-52 sm:h-60">
          {/* Top row: 2 images */}
          <div className="flex flex-row gap-0.5 w-full h-[55%]">
            <div className="relative w-1/2 h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[0]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-1/2 h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[1]} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Bottom row: 3 images */}
          <div className="flex flex-row gap-0.5 w-full h-[45%]">
            <div className="relative w-1/3 h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[2]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-1/3 h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[3]} className="w-full h-full object-cover" />
            </div>
            <div className="relative w-1/3 h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23]">
              <LinkedInImageItem url={postImages[4]} className="w-full h-full object-cover" />
              {postImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
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
    <div className="flex flex-col h-full bg-white dark:bg-[#1b1f23] text-slate-900 dark:text-[#e8e9ea] font-sans rounded-2xl border border-slate-200/80 dark:border-[#38434f] overflow-hidden pb-1 shadow-sm">
      {/* Author Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {author?.avatar_url && !avatarError ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              onError={() => setAvatarError(true)}
              {...({ referrerPolicy: "no-referrer" } as any)}
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#28323d] object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#28323d] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <span className="font-bold text-slate-900 dark:text-[#e8e9ea] text-[13.5px] truncate">{author?.name || 'LinkedIn Member'}</span>
          </div>
        </div>

        {/* Top Right Logo & Vertical 3-dots Menu */}
        <div className="flex items-center gap-1.5 shrink-0 self-start ml-2">
          <div className="p-0.5">
            <LinkedInLogo />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#28323d] dark:hover:text-[#e8e9ea] transition-colors cursor-pointer text-slate-500 dark:text-[#8e959e] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#1b1f23] border border-slate-200 dark:border-[#38434f] shadow-lg z-40 text-[13px] font-medium text-slate-900 dark:text-[#e8e9ea] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#28323d] transition-colors">Edit bookmark</button>
                <hr className="border-slate-200 dark:border-[#38434f] my-1" />
                <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[#ff4500] transition-colors">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Body */}
      <div className="px-3.5 pb-2 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e8e9ea]">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={150}
            className="text-[13px] leading-relaxed whitespace-pre-wrap break-words text-slate-900 dark:text-[#e8e9ea]"
            buttonClassName="ml-1 text-[#0a66c2] dark:text-[#70b5f9] font-semibold hover:underline"
          />
        </a>
      </div>

      {/* Media Section: Playable Video if videoUrl or Multi-Image Grid */}
      {videoUrl && !videoError ? (
        <div className="w-full bg-slate-100 dark:bg-black overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 flex items-center justify-center">
          <video
            key={videoUrl}
            controls
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            className="w-full max-h-[360px] object-contain bg-slate-100 dark:bg-black"
            poster={postImages[0] || bookmark.snapshot || undefined}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        </div>
      ) : (
        renderImageGrid()
      )}

      {/* Native LinkedIn Action Bar */}
      <div className="px-1.5 py-1.5 flex items-center justify-around text-[11px] font-semibold text-slate-600 dark:text-[#8e959e] border-t border-slate-200 dark:border-[#38434f]/40 mt-auto">
        <div className="flex items-center gap-1 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-1.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <LikeIcon />
          <span>{metrics?.reactions ? formatNumber(metrics.reactions) : "Like"}</span>
        </div>
        <div className="flex items-center gap-1 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-1.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <CommentIcon />
          <span>{metrics?.comments ? formatNumber(metrics.comments) : "Comment"}</span>
        </div>
        <div className="flex items-center gap-1 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-1.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <RepostIcon />
          <span>{metrics?.reposts ? formatNumber(metrics.reposts) : "Repost"}</span>
        </div>
        <div className="flex items-center gap-1 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-1.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <SendIcon />
          <span>Send</span>
        </div>
      </div>
    </div>
  );
}
