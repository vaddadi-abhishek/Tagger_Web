import React, { useState } from "react";
import type { Bookmark, XCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";

interface TwitterCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

function TwitterImageItem({
  url,
  alt = "X post media",
  className = "w-full h-full object-cover",
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const getProxyUrl = (raw?: string | null) => {
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    return `${baseUrl}/proxy-image?url=${encodeURIComponent(raw)}`;
  };

  const [src, setSrc] = useState<string>(() => url);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (src === url && url) {
      setSrc(getProxyUrl(url));
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`bg-slate-100 dark:bg-[#16181c] flex items-center justify-center text-slate-400 dark:text-slate-600 ${className}`}>
        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
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

export function TwitterCard(props: TwitterCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onRequestEdit,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: XCardData | null = React.useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData);
      } catch {
        return null;
      }
    }
    return rawCardData as XCardData;
  }, [rawCardData]);

  const author = cardData?.author || (bookmark as any)?.author;
  const metrics = cardData?.metrics || (bookmark as any)?.metrics;
  const postedAt = cardData?.posted_at || (bookmark as any)?.posted_at || bookmark.created_at;

  // Extract playable video URL (supports direct video object, string array, videos array, or snapshot mp4)
  const findVideoUrl = (): string | null => {
    const rawMedia = cardData?.media || (bookmark as any)?.media || (bookmark as any)?.card_data?.media;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          if (m.includes(".mp4") || m.includes("video.twimg.com") || m.includes("/vid/") || m.includes("video")) {
            return m;
          }
        } else if (typeof m === "object") {
          if (m.type === "video" && m.url) return m.url;
          if (m.type === "gif" && m.url) return m.url;
          if (m.url && (m.url.includes(".mp4") || m.url.includes("video.twimg.com") || m.url.includes("/vid/"))) {
            return m.url;
          }
        }
      }
    }
    if (Array.isArray((cardData as any)?.videos)) {
      const v = (cardData as any).videos[0];
      if (typeof v === "string") return v;
      if (v?.url) return v.url;
    }
    if (Array.isArray((cardData as any)?.media_extended)) {
      const v = (cardData as any).media_extended.find(
        (m: any) => m?.type === "video" || m?.type === "gif" || (m?.url && (m.url.includes(".mp4") || m.url.includes("video.twimg.com")))
      );
      if (v?.url) return v.url;
    }
    if ((cardData as any)?.video_url) return (cardData as any).video_url;
    if ((cardData as any)?.videoUrl) return (cardData as any).videoUrl;
    if ((cardData as any)?.video?.url) return (cardData as any).video.url;
    if ((bookmark as any)?.video_url) return (bookmark as any).video_url;
    if (bookmark.snapshot && (/\.mp4(?:\?.*)?$/i.test(bookmark.snapshot) || bookmark.snapshot.includes("video.twimg.com") || bookmark.snapshot.includes("/vid/"))) {
      return bookmark.snapshot;
    }
    return null;
  };

  const videoUrl = findVideoUrl();
  const [videoError, setVideoError] = useState(false);

  // Extract all valid image URLs from cardData.media, photos, mediaURLs, or bookmark.snapshot
  const postImages: string[] = React.useMemo(() => {
    const list: string[] = [];
    const addUrl = (u: any) => {
      if (!u || typeof u !== "string") return;
      const trimmed = u.trim();
      if (!trimmed) return;
      if (trimmed.includes(".mp4") || trimmed.includes("video.twimg.com") || trimmed.includes("/vid/")) {
        return;
      }
      if (!list.includes(trimmed)) {
        list.push(trimmed);
      }
    };

    const rawMedia = cardData?.media || (bookmark as any)?.media || (bookmark as any)?.card_data?.media;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          addUrl(m);
        } else if (typeof m === "object") {
          if (m.type !== "video" && m.type !== "gif") {
            addUrl(m.url);
          }
        }
      }
    }

    if (Array.isArray((cardData as any)?.photos)) {
      for (const p of (cardData as any).photos) {
        addUrl(typeof p === "string" ? p : p?.url);
      }
    }
    if (Array.isArray((cardData as any)?.images)) {
      for (const img of (cardData as any).images) {
        addUrl(typeof img === "string" ? img : img?.url);
      }
    }
    if (Array.isArray((cardData as any)?.media_extended)) {
      for (const item of (cardData as any).media_extended) {
        if (item?.type !== "video" && item?.type !== "gif") {
          addUrl(item?.url);
        }
      }
    }
    if (Array.isArray((cardData as any)?.mediaURLs)) {
      for (const u of (cardData as any).mediaURLs) {
        addUrl(u);
      }
    }

    if (list.length === 0 && bookmark.snapshot && !bookmark.snapshot.includes(".mp4") && !bookmark.snapshot.includes("video.twimg.com") && !bookmark.snapshot.includes("/vid/")) {
      addUrl(bookmark.snapshot);
    }
    return list;
  }, [cardData, bookmark]);

  const hasMedia = Boolean(videoUrl || postImages.length > 0);

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    // 1 image: Display full uncropped image
    if (postImages.length === 1) {
      return (
        <div className="px-4 mt-3">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2f3336] bg-slate-100 dark:bg-zinc-900/60"
          >
            <TwitterImageItem
              url={postImages[0]}
              className="w-full h-auto max-h-[550px] object-contain mx-auto block"
            />
          </a>
        </div>
      );
    }

    // 2 images: 2 columns side-by-side
    if (postImages.length === 2) {
      return (
        <div className="px-4 mt-3">
          <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-64 sm:h-80 bg-slate-200 dark:bg-[#2f3336]">
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block group/img">
              <TwitterImageItem url={postImages[0]} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block group/img">
              <TwitterImageItem url={postImages[1]} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
            </a>
          </div>
        </div>
      );
    }

    // 3 images: 1 tall on left, 2 stacked on right
    if (postImages.length === 3) {
      return (
        <div className="px-4 mt-3">
          <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-72 sm:h-88 bg-slate-200 dark:bg-[#2f3336]">
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="row-span-2 col-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block group/img">
              <TwitterImageItem url={postImages[0]} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block group/img">
              <TwitterImageItem url={postImages[1]} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block group/img">
              <TwitterImageItem url={postImages[2]} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
            </a>
          </div>
        </div>
      );
    }

    // 4+ images: 2x2 grid with +N on the 4th item if > 4
    return (
      <div className="px-4 mt-3">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-72 sm:h-88 bg-slate-200 dark:bg-[#2f3336]">
          {postImages.slice(0, 4).map((imgUrl, idx) => (
            <a
              key={idx}
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block group/img"
            >
              <TwitterImageItem url={imgUrl} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
              {idx === 3 && postImages.length > 4 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                  +{postImages.length - 3}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Exact Twitter SVGs
  const ReplyIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
  );

  const RepostIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></svg>
  );

  const LikeIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></svg>
  );

  const BookmarkIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></svg>
  );

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
  );

  const VerifiedIcon = () => (
    <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-[1.125rem] h-[1.125rem] shrink-0 fill-[#1d9bf0]">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.084.34-.13.69-.13 1.05 0 2.21 1.71 4 3.918 4 .58 0 1.13-.153 1.616-.425 1.492 1.253 3.39 2 5.466 2 2.076 0 3.973-.747 5.466-2 .486.272 1.036.425 1.616.425 2.21 0 3.918-1.792 3.918-4 0-.36-.046-.71-.13-1.05 1.105-.704 1.846-1.99 1.846-3.45z"></path>
      <path fill="black" d="M10.67 15.266L7.336 12l1.378-1.42 1.956 1.897 4.542-4.66 1.42 1.378-5.963 6.07z"></path>
    </svg>
  );

  const XIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.25rem] h-[1.25rem] fill-slate-900 dark:fill-[#e7e9ea] shrink-0">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
  );



  const formatNumber = (num?: number) => {
    if (!num || num <= 0) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleText = author?.handle ? (author.handle.startsWith('@') ? author.handle : `@${author.handle}`) : '';

  const formatDetailDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    const timeStr = date.toLocaleTimeString('en-US', timeOptions);
    const dateStr = date.toLocaleDateString('en-US', dateOptions);
    return `${timeStr} · ${dateStr}`;
  };

  const VerticalMoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#e7e9ea] font-sans pb-3 rounded-[1.75rem] border border-slate-200/80 dark:border-[#2f3336] overflow-hidden shadow-md">
      {/* Header Stacked */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              {...({ referrerPolicy: "no-referrer" } as any)}
              className="w-11 h-11 rounded-full bg-slate-200 dark:bg-[#16181c] object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-[#16181c] shrink-0" />
          )}
          <div className="flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea] text-[15px] truncate">{author?.name || 'X User'}</span>
              {author?.verified && <VerifiedIcon />}
            </div>
            <span className="text-slate-500 dark:text-[#71767b] text-[15px] leading-tight truncate">{handleText}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 dark:text-[#71767b] shrink-0">
          <div className="p-1 transition-colors">
            <XIcon />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1.5 rounded-lg hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer text-slate-500 dark:text-[#71767b] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-[#2f3336] shadow-lg z-40 text-[14px] font-medium text-slate-900 dark:text-[#e7e9ea] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#16181c] transition-colors">Edit bookmark</button>
                <hr className="border-slate-200 dark:border-[#2f3336] my-1" />
                <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[#f4212e] transition-colors">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tweet Body */}
      <div className="px-4 mt-3">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e7e9ea]">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={hasMedia ? 250 : 350}
            className={`${hasMedia ? "text-[15px]" : "text-[17px]"} leading-normal whitespace-pre-wrap break-words`}
            buttonClassName="ml-1 text-[#1d9bf0] hover:underline"
          />
        </a>
      </div>

      {/* Media: Playable Video or Multi-Image Grid */}
      {hasMedia && (
        videoUrl && !videoError ? (
          <div className="px-4 mt-3">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-[#2f3336]">
              <video
                key={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[520px] object-contain bg-black mx-auto block"
                poster={
                  bookmark.snapshot && !bookmark.snapshot.includes(".mp4") && !bookmark.snapshot.includes("video.twimg.com") && !bookmark.snapshot.includes("/vid/")
                    ? bookmark.snapshot
                    : postImages[0] || undefined
                }
                onError={() => setVideoError(true)}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        ) : videoUrl && videoError ? (
          <div className="px-4 mt-3">
            <div className="w-full rounded-2xl p-5 bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-[13px] text-slate-300">Video playback unavailable in direct preview</p>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setVideoError(false)}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  Retry
                </button>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium transition cursor-pointer"
                >
                  Open Video ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          renderImageGrid()
        )
      )}

      {/* Date & Views Row */}
      {(formatDetailDate(postedAt) || metrics?.views) && (
        <div className="px-4 mt-4">
          <div className="flex flex-wrap items-center gap-1 text-[15px] text-slate-500 dark:text-[#71767b]">
            {formatDetailDate(postedAt) && <span>{formatDetailDate(postedAt)}</span>}
            {metrics?.views ? (
              <>
                {formatDetailDate(postedAt) && <span>·</span>}
                <span className="font-bold text-slate-900 dark:text-[#e7e9ea] ml-0.5">{formatNumber(metrics.views)}</span>
                <span>Views</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      <hr className="border-slate-200 dark:border-[#2f3336] mx-4 mt-3" />

      {/* Action Row */}
      <div className="px-4 py-3 flex justify-between items-center text-slate-500 dark:text-[#71767b]">
        <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-2"><ReplyIcon /></div>
          {formatNumber(metrics?.replies) && <span>{formatNumber(metrics.replies)}</span>}
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#00ba7c] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#00ba7c]/10 transition-colors -ml-2"><RepostIcon /></div>
          {formatNumber(metrics?.reposts) && <span>{formatNumber(metrics.reposts)}</span>}
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#f91880] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#f91880]/10 transition-colors -ml-2"><LikeIcon /></div>
          {formatNumber(metrics?.likes) && <span>{formatNumber(metrics.likes)}</span>}
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-2"><BookmarkIcon /></div>
          {formatNumber(metrics?.bookmarks) && <span>{formatNumber(metrics.bookmarks)}</span>}
        </div>
        <div className="flex items-center hover:text-[#1d9bf0] transition-colors cursor-pointer group/action">
          <div className="p-2 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors"><ShareIcon /></div>
        </div>
      </div>
    </div>
  );
}
