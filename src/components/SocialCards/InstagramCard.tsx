import React, { useState, useMemo, useEffect } from "react";
import type { Bookmark, InstagramCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { CarouselNavButtons } from "./CarouselNavButtons";
import { SafeImage } from "./SafeImage";
import {
  InstagramBrandLogo,
  InstagramLikeIcon,
  InstagramCommentIcon,
  InstagramRepostIcon,
  InstagramShareAirplaneIcon,
  InstagramBookmarkRibbonIcon,
  VerifiedBadge,
  VerticalMoreIcon,
} from "./SocialCardIcons";

interface InstagramCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

function formatInstagramDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return null;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} MINUTES AGO`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "HOUR" : "HOURS"} AGO`;
    }
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "DAY" : "DAYS"} AGO`;
    }
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
      .toUpperCase();
  } catch {
    return null;
  }
}

function formatNumber(num?: number): string | null {
  if (!num || num <= 0) return null;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export const InstagramCard = React.memo(function InstagramCard(props: InstagramCardProps) {
  const {
    bookmark,
    onToggleMenu,
    isMenuOpen,
    onRequestEdit,
    onRequestDelete,
    onCloseMenu,
  } = props;

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Reset active slide index when card switches
  useEffect(() => {
    setActiveMediaIdx(0);
  }, [bookmark.id]);

  const rawCardData = bookmark.card_data;
  const cardData: InstagramCardData | null = useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData) as InstagramCardData;
      } catch {
        return null;
      }
    }
    return rawCardData as InstagramCardData;
  }, [rawCardData]);

  const author = cardData?.author;
  const metrics = cardData?.metrics;

  // Extract all media items
  const mediaItems: Array<{ type: "image" | "video"; url: string }> = useMemo(() => {
    const items: Array<{ type: "image" | "video"; url: string }> = [];
    const seenUrls = new Set<string>();

    const addItem = (rawItem: unknown, defaultType: "image" | "video" = "image") => {
      if (!rawItem) return;
      let url = "";
      let type: "image" | "video" = defaultType;

      if (typeof rawItem === "string") {
        url = rawItem.trim();
        if (
          url.includes(".mp4") ||
          url.includes("/reel/") ||
          url.includes("/video/") ||
          url.includes("video_url")
        ) {
          type = "video";
        }
      } else if (typeof rawItem === "object" && rawItem !== null) {
        const itemObj = rawItem as Record<string, unknown>;
        url = (
          (itemObj.url as string) ||
          (itemObj.src as string) ||
          (itemObj.display_url as string) ||
          (itemObj.video_url as string) ||
          (itemObj.media_url as string) ||
          (itemObj.image_url as string) ||
          ""
        ).trim();

        if (
          itemObj.type === "video" ||
          itemObj.is_video === true ||
          Boolean(itemObj.video_url) ||
          url.includes(".mp4")
        ) {
          type = "video";
        }
      }

      if (!url || seenUrls.has(url)) return;
      if (
        url.includes("150x150") ||
        url.includes("s150x150") ||
        url.includes("profile_pic") ||
        url.includes("avatar")
      ) {
        return;
      }

      seenUrls.add(url);
      items.push({ type, url });
    };

    const rawImages = cardData?.images;
    if (Array.isArray(rawImages)) {
      for (const img of rawImages) {
        addItem(img, "image");
      }
    }

    const rawMedia = cardData?.media;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        addItem(m, m.type === "video" ? "video" : "image");
      }
    }

    if (items.length === 0 && bookmark.snapshot) {
      const isSnapVideo =
        bookmark.snapshot.includes(".mp4") ||
        bookmark.snapshot.includes("/reel/") ||
        bookmark.snapshot.includes("/video/");
      addItem(bookmark.snapshot, isSnapVideo ? "video" : "image");
    }

    return items;
  }, [cardData, bookmark.snapshot]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaIdx((prev) => (prev < mediaItems.length - 1 ? prev + 1 : prev));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45 && activeMediaIdx < mediaItems.length - 1) {
      setActiveMediaIdx((prev) => prev + 1);
    } else if (diff < -45 && activeMediaIdx > 0) {
      setActiveMediaIdx((prev) => prev - 1);
    }
    setTouchStartX(null);
  };

  const currentMedia = mediaItems[activeMediaIdx];
  const postDate = cardData?.posted_at || bookmark.created_at;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#f5f5f5] font-sans rounded-2xl border border-slate-200/80 dark:border-[#262626] overflow-hidden pb-3 shadow-sm">
      {/* 1. Header: Avatar, Username, Badge, IG Logo & Menu */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-[#262626]/60">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {/* Avatar with IG gradient ring */}
          <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-black p-[1px]">
              {author?.avatar_url ? (
                <SafeImage
                  url={author.avatar_url}
                  alt={author.name || author.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-zinc-800" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-[13px] text-slate-900 dark:text-[#f5f5f5] truncate">
              {author?.username || author?.name || "instagram"}
            </span>
            {author?.verified && <VerifiedBadge />}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <div className="p-0.5 shrink-0">
            <InstagramBrandLogo />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors cursor-pointer text-slate-500 dark:text-[#a8a8a8] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-[#262626] shadow-lg z-40 text-[13px] font-medium text-slate-900 dark:text-[#f5f5f5] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEdit?.(bookmark);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  Edit bookmark
                </button>
                <hr className="border-slate-200 dark:border-[#262626] my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete?.(bookmark.id);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[#ed4956] transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Media Area (Full Carousel or Single Media) */}
      {mediaItems.length > 0 && (
        <div
          className="relative w-full bg-slate-100 dark:bg-black overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentMedia.type === "video" ? (
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              controls
              playsInline
              className="w-full max-h-[420px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          ) : (
            <a
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="block w-full overflow-hidden"
            >
              <SafeImage
                url={currentMedia.url}
                alt="Instagram post media"
                className="w-full h-auto max-h-[420px] object-contain mx-auto block bg-slate-100 dark:bg-black"
              />
            </a>
          )}

          {/* Carousel Slide Indicators */}
          {mediaItems.length > 1 && (
            <>
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-semibold text-white">
                {activeMediaIdx + 1}/{mediaItems.length}
              </div>
              <CarouselNavButtons
                activeIndex={activeMediaIdx}
                total={mediaItems.length}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </>
          )}
        </div>
      )}

      {/* 3. Action Buttons & Carousel Dots */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3.5 text-slate-900 dark:text-white">
          <button className="hover:opacity-60 transition-opacity cursor-pointer">
            <InstagramLikeIcon />
          </button>
          <button className="hover:opacity-60 transition-opacity cursor-pointer">
            <InstagramCommentIcon />
          </button>
          <button className="hover:opacity-60 transition-opacity cursor-pointer">
            <InstagramShareAirplaneIcon />
          </button>
          <button className="hover:opacity-60 transition-opacity cursor-pointer">
            <InstagramRepostIcon />
          </button>
        </div>

        {mediaItems.length > 1 && (
          <div className="flex items-center gap-1">
            {mediaItems.map((_, idx) => (
              <span
                key={idx}
                className={`size-1.5 rounded-full transition-all ${
                  idx === activeMediaIdx
                    ? "bg-[#0095f6] w-2.5"
                    : "bg-slate-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        )}

        <button className="hover:opacity-60 transition-opacity cursor-pointer text-slate-900 dark:text-white">
          <InstagramBookmarkRibbonIcon />
        </button>
      </div>

      {/* 4. Likes Count */}
      {metrics?.likes ? (
        <div className="px-3 pt-0.5">
          <span className="font-bold text-[12.5px] text-slate-900 dark:text-[#f5f5f5]">
            {formatNumber(metrics.likes)} likes
          </span>
        </div>
      ) : null}

      {/* 5. Caption / Title */}
      <div className="px-3 mt-1 text-[13px] leading-relaxed text-slate-900 dark:text-[#f5f5f5]">
        <ExpandableText
          prefix={
            author?.username ? (
              <span className="font-bold mr-1.5 inline">
                {author.username}
              </span>
            ) : null
          }
          text={bookmark.description || bookmark.title}
          maxLength={140}
          className="text-[13px] leading-normal"
          buttonClassName="text-slate-400 dark:text-[#a8a8a8] hover:text-slate-600 dark:hover:text-white ml-1 font-normal"
        />
      </div>

      {/* 6. Comments link & Timestamp */}
      <div className="px-3 mt-1.5 space-y-1">
        {metrics?.comments ? (
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block text-[12px] text-slate-500 dark:text-[#a8a8a8] hover:underline"
          >
            View all {formatNumber(metrics.comments)} comments
          </a>
        ) : null}

        {formatInstagramDate(postDate) && (
          <div className="text-[10px] tracking-wider text-slate-400 dark:text-[#737373] uppercase font-medium">
            {formatInstagramDate(postDate)}
          </div>
        )}
      </div>
    </div>
  );
});
