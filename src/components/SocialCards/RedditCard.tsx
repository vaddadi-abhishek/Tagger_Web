import React, { useState, useMemo, useEffect } from "react";
import type { Bookmark, RedditCardData, MediaItem } from "../../types/bookmark";
import { sanitizeUrl, formatNumber, formatRelativeDate, parseCardData } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { CarouselNavButtons } from "./CarouselNavButtons";
import { SafeImage } from "./SafeImage";
import { SafeVideo } from "./SafeVideo";
import {
  RedditAlienLogo,
  UpvoteIcon,
  DownvoteIcon,
  CommentIcon,
  ShareIcon,
} from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

interface RedditCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

export const RedditCard = React.memo(function RedditCard(props: RedditCardProps) {
  const {
    bookmark,
    onToggleMenu,
    isMenuOpen,
    onViewAiContext,
    onGenerateAiContext,
    isGeneratingAi,
    onRequestDelete,
    onCloseMenu,
  } = props;

  const cardData = useMemo(
    () => parseCardData<RedditCardData>(bookmark.card_data),
    [bookmark.card_data]
  );

  const subreddit = cardData?.subreddit;
  const metrics = cardData?.metrics;

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [subIconError, setSubIconError] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveMediaIdx(0);
    setSubIconError(false);
  }, [bookmark.id]);

  const mediaItems: MediaItem[] = useMemo(() => {
    if (Array.isArray(cardData?.media) && cardData.media.length > 0) {
      return cardData.media;
    }
    return [];
  }, [cardData?.media]);

  const videoItem = mediaItems.find((m) => m.type === "video");
  const imageItems = mediaItems.filter((m) => m.type !== "video");

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45 && activeMediaIdx < imageItems.length - 1) {
      setActiveMediaIdx((prev) => prev + 1);
    } else if (diff < -45 && activeMediaIdx > 0) {
      setActiveMediaIdx((prev) => prev - 1);
    }
    setTouchStartX(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaIdx((prev) => (prev < imageItems.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1a1b] text-slate-900 dark:text-[#d7dadc] font-sans rounded-2xl border border-slate-200/80 dark:border-[#343536] overflow-hidden pb-1 shadow-sm">
      {/* 1. Subreddit Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {subreddit?.icon_url && !subIconError ? (
            <img
              src={subreddit.icon_url}
              alt={subreddit.name}
              referrerPolicy="no-referrer"
              onError={() => setSubIconError(true)}
              className="w-7.5 h-7.5 rounded-full bg-[var(--accent-bg)] object-cover shrink-0 border border-slate-200/50 dark:border-white/10"
            />
          ) : (
            <div className="w-7.5 h-7.5 rounded-full bg-[#ff4500] flex items-center justify-center text-white shrink-0 shadow-sm">
              <RedditAlienLogo />
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden flex-1">
            <div className="flex items-center gap-1 text-[12.5px] truncate">
              <span className="font-bold text-slate-900 dark:text-[#d7dadc] hover:underline cursor-pointer">
                {subreddit?.name || "Reddit"}
              </span>
              {formatRelativeDate(cardData?.posted_at) && (
                <>
                  <span className="text-slate-400 dark:text-[#818384] text-[10px]">•</span>
                  <span className="text-slate-500 dark:text-[#818384] text-[11px]">
                    {formatRelativeDate(cardData?.posted_at)}
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-[#818384] truncate">
              {cardData?.author ? `${cardData.author}` : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <CardActionMenu
            bookmark={bookmark}
            isOpen={Boolean(isMenuOpen)}
            onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
            onClose={onCloseMenu || (() => {})}
            onViewAiContext={onViewAiContext}
            onGenerateAiContext={onGenerateAiContext}
            isGeneratingAi={isGeneratingAi}
            onRequestDelete={onRequestDelete}
            theme="reddit"
            icon="vertical"
            buttonClassName="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#272729] transition-colors cursor-pointer text-slate-500 dark:text-[#818384] outline-none"
          />
        </div>
      </div>

      {/* 2. Post Title */}
      <div className="px-3.5 mb-2">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] font-semibold text-slate-900 dark:text-[#d7dadc] leading-snug hover:underline block"
        >
          {bookmark.title}
        </a>
      </div>

      {/* 3. Text Body (if description differs from title) */}
      {bookmark.description && bookmark.description !== bookmark.title && (
        <div className="px-3.5 mb-2">
          <ExpandableText
            text={bookmark.description}
            className="text-[12.5px] text-slate-600 dark:text-[#a4a7a8] leading-relaxed"
          />
        </div>
      )}

      {/* 4. Media Area */}
      {videoItem ? (
        <div className="w-full bg-slate-100 dark:bg-black overflow-hidden border-y border-slate-200 dark:border-[#343536]">
          <SafeVideo
            key={videoItem.url}
            src={videoItem.url}
            poster={cardData?.video_thumbnail}
            controls
            playsInline
            className="w-full max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
          />
        </div>
      ) : imageItems.length > 0 ? (
        <div
          className="relative w-full bg-slate-100 dark:bg-black overflow-hidden border-y border-slate-200 dark:border-[#343536]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full overflow-hidden"
          >
            <SafeImage
              url={imageItems[activeMediaIdx]?.url}
              alt="Reddit media"
              className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>

          {imageItems.length > 1 && (
            <>
              <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-sm text-[11px] font-semibold text-white">
                {activeMediaIdx + 1}/{imageItems.length}
              </div>
              <CarouselNavButtons
                activeIndex={activeMediaIdx}
                total={imageItems.length}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </>
          )}
        </div>
      ) : null}

      {/* 5. Footer: Upvote pill, Comment pill, Share pill */}
      <div className="px-3.5 py-2 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5">
          {/* Reddit Pill Vote Container */}
          <div className="flex items-center bg-slate-100 dark:bg-[#272729] rounded-full text-slate-600 dark:text-[#d7dadc] overflow-hidden">
            <button className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-[#343536] hover:text-[#ff4500] transition-colors cursor-pointer flex items-center">
              <UpvoteIcon />
            </button>
            <span className="text-[12px] font-bold px-1 select-none">
              {formatNumber(metrics?.upvotes) || "Vote"}
            </span>
            <button className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-[#343536] hover:text-[#7193ff] transition-colors cursor-pointer flex items-center">
              <DownvoteIcon />
            </button>
          </div>

          {/* Comment Pill */}
          <button className="bg-slate-100 hover:bg-slate-200 dark:bg-[#272729] dark:hover:bg-[#343536] rounded-full px-2.5 py-1 text-[12px] font-medium text-slate-600 dark:text-[#d7dadc] flex items-center gap-1.5 cursor-pointer transition-colors">
            <CommentIcon className="w-3.5 h-3.5" />
            <span>{formatNumber(metrics?.comments) || "0"}</span>
          </button>
        </div>

        {/* Share Pill */}
        <button className="bg-slate-100 hover:bg-slate-200 dark:bg-[#272729] dark:hover:bg-[#343536] rounded-full px-2.5 py-1 text-[12px] font-medium text-slate-600 dark:text-[#d7dadc] flex items-center gap-1 cursor-pointer transition-colors">
          <ShareIcon className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
});
