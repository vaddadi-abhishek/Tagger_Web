import React, { useState, useMemo } from "react";
import type { Bookmark, YouTubeCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { SafeImage } from "./SafeImage";
import {
  YouTubeBrandLogo,
  YouTubeLikeIcon,
  YouTubeDislikeIcon,
  ShareIcon,
  SparkleIcon,
  VerifiedBadge,
  VerticalMoreIcon,
} from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

interface YouTubeCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

function formatNumber(num?: number): string | null {
  if (!num || num <= 0) return null;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export const YouTubeCard = React.memo(function YouTubeCard(props: YouTubeCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onViewAiContext,
    onGenerateAiContext,
    isGeneratingAi,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: YouTubeCardData | null = useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData) as YouTubeCardData;
      } catch {
        return null;
      }
    }
    return rawCardData as YouTubeCardData;
  }, [rawCardData]);

  const channel = cardData?.channel;
  const metrics = cardData?.metrics;

  const [thumbSrc, setThumbSrc] = useState<string | null>(() => {
    if (cardData?.video_id) {
      return `https://i.ytimg.com/vi/${cardData.video_id}/maxresdefault.jpg`;
    }
    return bookmark.snapshot || null;
  });

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-[#f1f1f1] font-sans rounded-2xl border border-slate-200/80 dark:border-[#272727] overflow-hidden pb-1 shadow-sm">
      {/* 1. Video Thumbnail Header */}
      <div className="relative w-full aspect-video bg-slate-100 dark:bg-black overflow-hidden group/video">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="block w-full h-full"
        >
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={bookmark.title}
              onError={handleThumbError}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/video:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-zinc-800">
              <YouTubeBrandLogo className="w-16 h-11" />
            </div>
          )}

          {/* Central Play Badge Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover/video:scale-100 transition-transform">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current translate-x-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </a>

        {/* Top-Right Logo & 3-dots Menu */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <div className="bg-black/60 backdrop-blur-md px-1.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center justify-center">
            <YouTubeBrandLogo className="w-5 h-3.5" />
          </div>
          <CardActionMenu
            bookmark={bookmark}
            isOpen={Boolean(isMenuOpen)}
            onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
            onClose={onCloseMenu || (() => {})}
            onViewAiContext={onViewAiContext}
            onGenerateAiContext={onGenerateAiContext}
            isGeneratingAi={isGeneratingAi}
            onRequestDelete={onRequestDelete}
            theme="youtube"
            buttonClassName="size-6 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer outline-none border border-white/20 shadow-sm flex items-center justify-center"
            customButtonContent={<VerticalMoreIcon className="w-4 h-4 fill-current" />}
          />
        </div>
      </div>

      {/* 2. Video Title & Channel Info */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="text-[13.5px] font-bold text-slate-900 dark:text-[#f1f1f1] hover:text-red-500 transition-colors leading-snug line-clamp-2 block"
          >
            {bookmark.title}
          </a>

          {/* Channel Name & Metrics */}
          <div className="flex items-center gap-2 mt-2">
            {channel?.avatar_url && (
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-zinc-800">
                <SafeImage
                  url={channel.avatar_url}
                  alt={channel.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col leading-tight overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-medium text-slate-700 dark:text-[#aaaaaa] truncate">
                  {channel?.name || bookmark.site_name || "YouTube"}
                </span>
                <VerifiedBadge className="w-3.5 h-3.5 fill-slate-500 dark:fill-[#aaaaaa] shrink-0" />
              </div>
              {metrics?.views ? (
                <span className="text-[11px] text-slate-500 dark:text-[#717171]">
                  {formatNumber(metrics.views)} views
                </span>
              ) : null}
            </div>
          </div>

          {/* Description snippet */}
          {bookmark.description && (
            <div className="mt-2 text-[12px] text-slate-600 dark:text-[#aaaaaa] leading-relaxed">
              <ExpandableText
                text={bookmark.description}
                maxLength={110}
                className="text-[12px]"
                buttonClassName="text-[var(--primary)] font-medium hover:underline ml-1"
              />
            </div>
          )}
        </div>

        {/* 3. Action Pill Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          {/* Like/Dislike Joint Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-[#272727] rounded-full text-slate-800 dark:text-[#f1f1f1] text-[11px] font-medium shrink-0">
            <button className="px-2.5 py-1 flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-colors">
              <YouTubeLikeIcon />
              {metrics?.likes ? <span>{formatNumber(metrics.likes)}</span> : <span>Like</span>}
            </button>
            <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-white/20" />
            <button className="px-2 py-1 flex items-center hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-colors">
              <YouTubeDislikeIcon />
            </button>
          </div>

          {/* Share Pill */}
          <button className="bg-slate-100 hover:bg-slate-200 dark:bg-[#272727] dark:hover:bg-white/10 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-800 dark:text-[#f1f1f1] flex items-center gap-1 shrink-0 cursor-pointer transition-colors border border-slate-200 dark:border-white/5">
            <ShareIcon className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Ask/Sparkle Pill */}
          <button className="bg-slate-100 hover:bg-slate-200 dark:bg-[#272727] dark:hover:bg-white/10 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-800 dark:text-[#f1f1f1] flex items-center gap-1 shrink-0 cursor-pointer transition-colors border border-slate-200 dark:border-white/5">
            <SparkleIcon />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
});
