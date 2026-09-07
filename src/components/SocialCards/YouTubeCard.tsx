import React, { useState } from "react";
import type { Bookmark, YouTubeCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";

interface YouTubeCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

export function YouTubeCard(props: YouTubeCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onRequestEdit,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: YouTubeCardData | null = React.useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData);
      } catch {
        return null;
      }
    }
    return rawCardData as YouTubeCardData;
  }, [rawCardData]);

  const channel = cardData?.channel || (bookmark as any)?.channel;
  const metrics = cardData?.metrics || (bookmark as any)?.metrics;

  const [thumbSrc, setThumbSrc] = useState<string | null>(() => {
    if (cardData?.video_id) {
      return `https://i.ytimg.com/vi/${cardData.video_id}/maxresdefault.jpg`;
    }
    return bookmark.snapshot || null;
  });

  const [avatarError, setAvatarError] = useState(false);

  const handleThumbError = () => {
    if (cardData?.video_id && thumbSrc?.includes("maxresdefault.jpg")) {
      setThumbSrc(`https://i.ytimg.com/vi/${cardData.video_id}/hqdefault.jpg`);
    } else if (cardData?.video_id && thumbSrc?.includes("hqdefault.jpg")) {
      setThumbSrc(`https://i.ytimg.com/vi/${cardData.video_id}/mqdefault.jpg`);
    } else if (thumbSrc !== bookmark.snapshot && bookmark.snapshot) {
      setThumbSrc(bookmark.snapshot);
    } else {
      setThumbSrc(null);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num || num <= 0) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // SVG Icons
  const VerifiedBadge = () => (
    <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-4 h-4 fill-slate-500 dark:fill-[#a8a8a8] shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.88 14.8L5.34 12.02l1.41-1.41 3.37 3.37 7.37-7.37 1.41 1.41-8.78 8.78z" />
    </svg>
  );

  const LikeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );

  const DislikeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </svg>
  );

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );

  const SparkleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );

  const YouTubeBrandLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#FF0000] shrink-0">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );

  const VerticalMoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-[#f1f1f1] font-sans rounded-2xl border border-slate-200/80 dark:border-[#272727] overflow-hidden pb-1 shadow-sm">
      {/* Video Thumbnail Header */}
      <div className="relative w-full aspect-video bg-slate-100 dark:bg-black overflow-hidden group/video">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block w-full h-full">
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={bookmark.title}
              onError={handleThumbError}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-[#272727] flex items-center justify-center text-slate-500 dark:text-[#a8a8a8] text-xs font-medium">
              <span>{bookmark.site_name || "YouTube"}</span>
            </div>
          )}

          {/* YouTube Branding Tag + Vertical 3 Dots Menu */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <div className="bg-black/70 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center">
              <YouTubeBrandLogo />
            </div>
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleMenu?.(bookmark.id, e);
                }}
                className="bg-black/70 backdrop-blur-md p-1.5 rounded-full hover:bg-black/90 text-white transition-colors cursor-pointer outline-none flex items-center justify-center"
                title="More options"
              >
                <VerticalMoreIcon />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#272727] shadow-lg z-40 text-[13px] font-medium text-slate-900 dark:text-[#f1f1f1] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestEdit?.(bookmark);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#272727] transition-colors"
                  >
                    Edit bookmark
                  </button>
                  <hr className="border-slate-200 dark:border-[#272727] my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDelete?.(bookmark.id);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[#ff4500] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm group-hover/video:bg-[#FF0000] transition-all duration-300 transform group-hover/video:scale-110 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-5 ml-0.5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Video Details Container */}
      <div className="px-3.5 py-2.5 flex flex-col flex-1">
        {/* Video Title */}
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block group">
          <h3 className="font-bold text-[14px] text-slate-900 dark:text-[#f1f1f1] leading-snug line-clamp-2 group-hover:text-[#065fd4] dark:group-hover:text-[#3ea6ff] transition-colors">
            {bookmark.title}
          </h3>
        </a>

        {/* Channel Info & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-auto">
          {/* Left Side: Avatar + Channel Name + Verified Badge + Subscribe Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {!avatarError && channel?.avatar_url ? (
              <img
                src={channel.avatar_url}
                alt={channel.name}
                onError={() => setAvatarError(true)}
                className="w-7.5 h-7.5 rounded-full bg-slate-200 dark:bg-[#272727] object-cover shrink-0"
              />
            ) : (
              <div className="w-7.5 h-7.5 rounded-full bg-slate-200 dark:bg-[#272727] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 opacity-60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            )}

            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold text-[12.5px] text-slate-900 dark:text-[#f1f1f1] truncate max-w-[120px]">
                {channel?.name || "YouTube Channel"}
              </span>
              <VerifiedBadge />
            </div>

            <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black font-semibold text-[11px] px-2.5 py-1 dark:hover:bg-[#d9d9d9] active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs ml-0.5">
              Subscribe
            </button>
          </div>

          {/* Right Side: Action Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Like / Dislike Split Pill */}
            <div className="bg-slate-100 dark:bg-[#272727] rounded-full flex items-center text-[11px] font-medium text-slate-800 dark:text-[#f1f1f1] shrink-0 border border-slate-200 dark:border-white/5 overflow-hidden">
              <button className="px-2.5 py-1 flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-colors">
                <LikeIcon />
                {formatNumber(metrics?.likes) ? (
                  <span>{formatNumber(metrics.likes)}</span>
                ) : formatNumber(metrics?.views) ? (
                  <span>{formatNumber(metrics.views)}</span>
                ) : null}
              </button>
              <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-white/20" />
              <button className="px-2 py-1 flex items-center hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-colors">
                <DislikeIcon />
              </button>
            </div>

            {/* Share Pill */}
            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-[#272727] dark:hover:bg-white/10 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-800 dark:text-[#f1f1f1] flex items-center gap-1 shrink-0 cursor-pointer transition-colors border border-slate-200 dark:border-white/5">
              <ShareIcon />
              <span>Share</span>
            </button>

            {/* Ask Pill */}
            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-[#272727] dark:hover:bg-white/10 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-800 dark:text-[#f1f1f1] flex items-center gap-1 shrink-0 cursor-pointer transition-colors border border-slate-200 dark:border-white/5">
              <SparkleIcon />
              <span>Ask</span>
            </button>
          </div>
        </div>

        {/* Expandable Description (Optional preview) */}
        {bookmark.description && (
          <div className="mt-3 pt-2 text-[13px] text-slate-600 dark:text-[#a8a8a8] leading-relaxed border-t border-slate-200 dark:border-[#272727]/60">
            <ExpandableText
              text={bookmark.description}
              maxLength={150}
              className="text-[13px] leading-snug break-words text-slate-600 dark:text-[#a8a8a8]"
              buttonClassName="ml-1 text-slate-900 dark:text-white font-semibold hover:underline"
            />
          </div>
        )}
      </div>
    </div>
  );
}
