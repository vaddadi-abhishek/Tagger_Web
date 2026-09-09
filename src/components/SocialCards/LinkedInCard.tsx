import React, { useState, useMemo } from "react";
import type { Bookmark, LinkedInCardData, MediaItem } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { SafeImage } from "./SafeImage";
import {
  LinkedInBrandLogo,
  LinkedInLikeIcon,
  LinkedInReactionBadge,
  LinkedInCommentIcon,
  LinkedInRepostIcon,
  LinkedInSendIcon,
} from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

interface LinkedInCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
}

function formatNumber(num?: number): string | null {
  if (!num) return null;
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export const LinkedInCard = React.memo(function LinkedInCard(props: LinkedInCardProps) {
  const {
    bookmark,
    onToggleMenu,
    isMenuOpen,
    onViewAiContext,
    onRequestDelete,
    onCloseMenu,
  } = props;

  const rawCardData = bookmark.card_data;
  const cardData: LinkedInCardData | null = useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData) as LinkedInCardData;
      } catch {
        return null;
      }
    }
    return rawCardData as LinkedInCardData;
  }, [rawCardData]);

  const author = cardData?.author;
  const metrics = cardData?.metrics;

  // Extract all valid image URLs
  const postImages: string[] = useMemo(() => {
    const list: string[] = [];
    const media = cardData?.media as Array<MediaItem | string> | undefined;
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
  }, [cardData?.media, bookmark.snapshot]);

  // Find video URL if available
  const videoUrl: string | null = useMemo(() => {
    const media = cardData?.media as Array<MediaItem | string> | undefined;
    if (Array.isArray(media)) {
      for (const m of media) {
        if (!m) continue;
        if (typeof m === "string" && m.includes(".mp4")) return m;
        if (typeof m === "object" && (m.type === "video" || m.url?.includes(".mp4"))) {
          return m.url;
        }
      }
    }
    if (bookmark.snapshot && /\.mp4(?:\?.*)?$/i.test(bookmark.snapshot)) {
      return bookmark.snapshot;
    }
    return null;
  }, [cardData?.media, bookmark.snapshot]);

  const [videoError, setVideoError] = useState(false);
  const hasMedia = Boolean(videoUrl || postImages.length > 0);

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    if (postImages.length === 1) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-100 dark:bg-black flex items-center justify-center">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <SafeImage
              url={postImages[0]}
              alt="LinkedIn media"
              className="w-full h-auto max-h-[360px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        </div>
      );
    }

    if (postImages.length === 2) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-200 dark:bg-[#28323d]">
          <div className="grid grid-cols-2 gap-0.5 w-full h-44 sm:h-52">
            <a
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23] block"
            >
              <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
            </a>
            <a
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23] block"
            >
              <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-200 dark:bg-[#28323d]">
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-48 sm:h-56">
          {postImages.slice(0, 4).map((imgUrl, idx) => (
            <a
              key={idx}
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1b1f23] block"
            >
              <SafeImage url={imgUrl} className="w-full h-full object-cover" />
              {idx === 3 && postImages.length > 4 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-xl">
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
    <div className="flex flex-col h-full bg-white dark:bg-[#1b1f23] text-slate-900 dark:text-[#f3f6f8] font-sans rounded-2xl border border-slate-200/80 dark:border-[#38434f] overflow-hidden pb-1 shadow-sm">
      {/* 1. Header: Avatar, Name & Options */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-[#28323d]">
              <SafeImage
                url={author.avatar_url}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#28323d] flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm shrink-0">
              {author?.name ? author.name[0].toUpperCase() : "IN"}
            </div>
          )}

          <div className="flex flex-col justify-center overflow-hidden leading-tight">
            <span className="font-semibold text-slate-900 dark:text-[#f3f6f8] text-[13.5px] truncate hover:underline cursor-pointer">
              {author?.name || "LinkedIn Member"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {bookmark.site_name || "LinkedIn"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <div className="p-0.5 shrink-0">
            <LinkedInBrandLogo />
          </div>
          <CardActionMenu
            bookmark={bookmark}
            isOpen={Boolean(isMenuOpen)}
            onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
            onClose={onCloseMenu || (() => {})}
            onViewAiContext={onViewAiContext}
            onRequestDelete={onRequestDelete}
            theme="linkedin"
            icon="vertical"
            buttonClassName="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#28323d] transition-colors cursor-pointer text-slate-500 dark:text-slate-400 outline-none"
          />
        </div>
      </div>

      {/* 2. Body Text */}
      <div className="px-3.5 mb-2">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="block text-slate-900 dark:text-[#f3f6f8]"
        >
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={hasMedia ? 160 : 260}
            className="text-[13px] leading-normal"
            buttonClassName="text-slate-500 dark:text-slate-400 hover:text-blue-500 ml-1 font-semibold"
          />
        </a>
      </div>

      {/* 3. Media: Video or Multi-Image Grid */}
      {hasMedia &&
        (videoUrl && !videoError ? (
          <div className="w-full border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-100 dark:bg-black">
            <video
              key={videoUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[380px] object-contain bg-slate-100 dark:bg-black mx-auto block"
              poster={bookmark.snapshot || postImages[0] || undefined}
              onError={() => setVideoError(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          </div>
        ) : (
          renderImageGrid()
        ))}

      {/* 4. Reactions Metric row */}
      {(metrics?.reactions || metrics?.comments) && (
        <div className="px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#38434f]/40">
          <div className="flex items-center gap-1.5">
            <LinkedInReactionBadge className="w-4 h-4 shrink-0" />
            <span>{formatNumber(metrics?.reactions) || "1"}</span>
          </div>
          {metrics?.comments ? <span>{formatNumber(metrics.comments)} comments</span> : null}
        </div>
      )}

      {/* 5. Action Buttons Footer */}
      <div className="px-2 py-1 flex items-center justify-between text-slate-600 dark:text-slate-300 text-[12px] font-semibold mt-auto">
        <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#28323d] rounded-lg transition-colors cursor-pointer">
          <LinkedInLikeIcon />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#28323d] rounded-lg transition-colors cursor-pointer">
          <LinkedInCommentIcon />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#28323d] rounded-lg transition-colors cursor-pointer">
          <LinkedInRepostIcon />
          <span className="hidden sm:inline">Repost</span>
        </button>
        <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#28323d] rounded-lg transition-colors cursor-pointer">
          <LinkedInSendIcon />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
});
