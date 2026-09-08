import React, { useState, useMemo } from "react";
import type { Bookmark, XCardData, MediaItem } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { SafeImage } from "./SafeImage";
import {
  ReplyIcon,
  RepostIcon,
  LikeHeartIcon,
  BookmarkIcon,
  ShareIcon,
  VerifiedBadge,
  XBrandLogo,
  VerticalMoreIcon,
} from "./SocialCardIcons";

interface TwitterCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
}

function formatNumber(num?: number): string | null {
  if (!num || num <= 0) return null;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDetailDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
  const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

  const timeStr = date.toLocaleTimeString("en-US", timeOptions);
  const dateStr = date.toLocaleDateString("en-US", dateOptions);
  return `${timeStr} · ${dateStr}`;
}

export const TwitterCard = React.memo(function TwitterCard(props: TwitterCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onViewAiContext,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: XCardData | null = useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData) as XCardData;
      } catch {
        return null;
      }
    }
    return rawCardData as XCardData;
  }, [rawCardData]);

  const author = cardData?.author;
  const metrics = cardData?.metrics;
  const postedAt = cardData?.posted_at || bookmark.created_at;

  // Extract playable video URL
  const videoUrl = useMemo((): string | null => {
    const rawMedia = cardData?.media as Array<MediaItem | string> | undefined;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          if (m.includes(".mp4") || m.includes("video.twimg.com") || m.includes("/vid/")) {
            return m;
          }
        } else if (typeof m === "object") {
          if ((m.type === "video" || m.type === "gif") && m.url) return m.url;
          if (m.url && (m.url.includes(".mp4") || m.url.includes("video.twimg.com") || m.url.includes("/vid/"))) {
            return m.url;
          }
        }
      }
    }

    if (
      bookmark.snapshot &&
      (/\.mp4(?:\?.*)?$/i.test(bookmark.snapshot) ||
        bookmark.snapshot.includes("video.twimg.com") ||
        bookmark.snapshot.includes("/vid/"))
    ) {
      return bookmark.snapshot;
    }
    return null;
  }, [cardData?.media, bookmark.snapshot]);

  const [videoError, setVideoError] = useState(false);

  // Extract all valid image URLs
  const postImages: string[] = useMemo(() => {
    const list: string[] = [];
    const addUrl = (u: unknown) => {
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

    const rawMedia = cardData?.media;
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

    if (list.length === 0 && bookmark.snapshot && !bookmark.snapshot.includes(".mp4") && !bookmark.snapshot.includes("video.twimg.com")) {
      addUrl(bookmark.snapshot);
    }
    return list;
  }, [cardData?.media, bookmark.snapshot]);

  const hasMedia = Boolean(videoUrl || postImages.length > 0);
  const handleText = author?.handle ? (author.handle.startsWith("@") ? author.handle : `@${author.handle}`) : "";

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    if (postImages.length === 1) {
      return (
        <div className="px-3.5 mt-2">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full overflow-hidden rounded-xl border border-slate-200 dark:border-[#2f3336] bg-slate-100 dark:bg-black"
          >
            <SafeImage
              url={postImages[0]}
              alt="X post media"
              className="w-full h-auto max-h-[360px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        </div>
      );
    }

    if (postImages.length === 2) {
      return (
        <div className="px-3.5 mt-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-44 sm:h-52 bg-slate-200 dark:bg-[#2f3336]">
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
            </a>
          </div>
        </div>
      );
    }

    if (postImages.length === 3) {
      return (
        <div className="px-3.5 mt-2">
          <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-48 sm:h-56 bg-slate-200 dark:bg-[#2f3336]">
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="row-span-2 col-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[2]} className="w-full h-full object-cover" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3.5 mt-2">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-48 sm:h-56 bg-slate-200 dark:bg-[#2f3336]">
          {postImages.slice(0, 4).map((imgUrl, idx) => (
            <a
              key={idx}
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block"
            >
              <SafeImage url={imgUrl} className="w-full h-full object-cover" />
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#e7e9ea] font-sans pb-2 rounded-2xl border border-slate-200/80 dark:border-[#2f3336] overflow-hidden shadow-sm">
      {/* Header Stacked */}
      <div className="px-3.5 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-[#16181c]">
              <SafeImage
                url={author.avatar_url}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#16181c] shrink-0" />
          )}
          <div className="flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea] text-[13.5px] truncate">
                {author?.name || "X User"}
              </span>
              {author?.verified && <VerifiedBadge />}
            </div>
            <span className="text-slate-500 dark:text-[#71767b] text-[12.5px] leading-tight truncate">
              {handleText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 dark:text-[#71767b] shrink-0">
          <div className="p-1 transition-colors">
            <XBrandLogo />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1 rounded-lg hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer text-slate-500 dark:text-[#71767b] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-[#2f3336] shadow-lg z-40 text-[13px] font-medium text-slate-900 dark:text-[#e7e9ea] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewAiContext?.(bookmark);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#16181c] transition-colors flex items-center gap-2 text-slate-800 dark:text-[#e7e9ea] hover:text-black dark:hover:text-white font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-3.5 shrink-0 opacity-70"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                    />
                  </svg>
                  <span>AI Context</span>
                </button>
                <hr className="border-slate-200 dark:border-[#2f3336] my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete?.(bookmark.id);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[#f4212e] transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tweet Body */}
      <div className="px-3.5 mt-2">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="block text-slate-900 dark:text-[#e7e9ea]"
        >
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={hasMedia ? 200 : 300}
            className={`${hasMedia ? "text-[13.5px]" : "text-[15px]"} leading-normal whitespace-pre-wrap break-words`}
            buttonClassName="ml-1 text-[#1d9bf0] hover:underline"
          />
        </a>
      </div>

      {/* Media: Playable Video or Multi-Image Grid */}
      {hasMedia &&
        (videoUrl && !videoError ? (
          <div className="px-3.5 mt-2">
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-[#2f3336]">
              <video
                key={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[360px] object-contain bg-slate-100 dark:bg-black mx-auto block"
                poster={
                  bookmark.snapshot &&
                  !bookmark.snapshot.includes(".mp4") &&
                  !bookmark.snapshot.includes("video.twimg.com")
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
          <div className="px-3.5 mt-2">
            <div className="w-full rounded-xl p-4 bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center gap-2">
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
                  className="text-xs px-2.5 py-1 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium transition cursor-pointer"
                >
                  Open Video ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          renderImageGrid()
        ))}

      {/* Date & Views Row */}
      {(formatDetailDate(postedAt) || metrics?.views) && (
        <div className="px-3.5 mt-2.5">
          <div className="flex flex-wrap items-center gap-1 text-[12px] text-slate-500 dark:text-[#71767b]">
            {formatDetailDate(postedAt) && <span>{formatDetailDate(postedAt)}</span>}
            {metrics?.views ? (
              <>
                {formatDetailDate(postedAt) && <span>·</span>}
                <span className="font-bold text-slate-900 dark:text-[#e7e9ea] ml-0.5">
                  {formatNumber(metrics.views)}
                </span>
                <span>Views</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      <hr className="border-slate-200 dark:border-[#2f3336] mx-3.5 mt-2" />

      {/* Action Row */}
      <div className="px-3.5 py-2 flex justify-between items-center text-slate-500 dark:text-[#71767b]">
        <div className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-1.5">
            <ReplyIcon />
          </div>
          {formatNumber(metrics?.replies) ? <span>{formatNumber(metrics?.replies)}</span> : null}
        </div>
        <div className="flex items-center gap-1 hover:text-[#00ba7c] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#00ba7c]/10 transition-colors -ml-1.5">
            <RepostIcon />
          </div>
          {formatNumber(metrics?.reposts) ? <span>{formatNumber(metrics?.reposts)}</span> : null}
        </div>
        <div className="flex items-center gap-1 hover:text-[#f91880] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#f91880]/10 transition-colors -ml-1.5">
            <LikeHeartIcon />
          </div>
          {formatNumber(metrics?.likes) ? <span>{formatNumber(metrics?.likes)}</span> : null}
        </div>
        <div className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-1.5">
            <BookmarkIcon />
          </div>
          {formatNumber(metrics?.bookmarks) ? <span>{formatNumber(metrics?.bookmarks)}</span> : null}
        </div>
        <div className="flex items-center hover:text-[#1d9bf0] transition-colors cursor-pointer group/action">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors">
            <ShareIcon />
          </div>
        </div>
      </div>
    </div>
  );
});
