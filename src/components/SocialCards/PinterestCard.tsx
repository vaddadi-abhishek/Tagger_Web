import React, { useMemo } from "react";
import type { Bookmark, PinterestCardData } from "../../types/bookmark";
import { sanitizeUrl, formatNumber, parseCardData } from "../../lib/utils";
import { SafeImage } from "./SafeImage";
import { PinterestBrandLogo, VerticalMoreIcon } from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

interface PinterestCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

/**
 * Formats ISO date strings (e.g. "2026-06-02T11:30:14.000Z") into clean date format "02-Jun-2026"
 */
function formatPinterestDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export const PinterestCard = React.memo(function PinterestCard(props: PinterestCardProps) {
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

  const cardData = useMemo(
    () => parseCardData<PinterestCardData>(bookmark.card_data),
    [bookmark.card_data]
  );

  const author = cardData?.author;
  const metrics = cardData?.metrics;

  // Resolve best image URL (card media)
  const imageUrl = useMemo(() => {
    if (cardData?.media && Array.isArray(cardData.media) && cardData.media.length > 0) {
      const firstImg = cardData.media.find((m) => m.type === "image" || !m.type);
      if (firstImg?.url) return firstImg.url;
    }
    return null;
  }, [cardData?.media]);

  const authorName = author?.name || author?.username || bookmark.site_name || "Pinterest";

  // Use posted_at in card_data for displaying date
  const displayDate = useMemo(() => {
    return formatPinterestDate(cardData?.posted_at);
  }, [cardData?.posted_at]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1c] text-slate-900 dark:text-[#f5f5f5] font-sans rounded-2xl border border-slate-200/80 dark:border-[#2e2e2e] overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      {/* 1. Hero Pin Image with Top-Right Pinterest Logo & 3-Dots Action Button */}
      <div className="relative w-full bg-slate-100 dark:bg-black overflow-hidden select-none">
        {imageUrl ? (
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full overflow-hidden"
          >
            <SafeImage
              url={imageUrl}
              alt={authorName}
              className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-slate-100 dark:bg-zinc-800">
            <PinterestBrandLogo className="size-10 opacity-30" />
          </div>
        )}

        {/* Top-Right Corner: Only Pinterest Logo & 3-Dots Action Button */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <div
            className="size-6.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-xs flex items-center justify-center"
            title="Pinterest"
          >
            <PinterestBrandLogo className="size-4 shrink-0" />
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
            theme="pinterest"
            icon="vertical"
            buttonClassName="size-6.5 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-slate-700 dark:text-zinc-200 backdrop-blur-md transition-colors cursor-pointer outline-none flex items-center justify-center shadow-xs"
            customButtonContent={<VerticalMoreIcon className="size-3.5 fill-current" />}
          />
        </div>
      </div>

      {/* 2. Date Section (using posted_at from card_data) */}
      {displayDate && (
        <div className="px-3.5 pt-2.5 pb-0.5">
          <span className="text-[11.5px] font-medium text-slate-500 dark:text-zinc-400">
            {displayDate}
          </span>
        </div>
      )}

      {/* 4. Published by Profile Pic & Name (matching reference image) */}
      <div className="px-3.5 pt-2 pb-3 flex items-center justify-between gap-2 mt-auto">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 min-w-0 overflow-hidden hover:opacity-85 transition-opacity"
        >
          <div className="size-7 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
            {author?.avatar_url ? (
              <SafeImage
                url={author.avatar_url}
                alt={authorName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-[10.5px] text-slate-500 dark:text-zinc-400">
                {authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 leading-none">
              Published by
            </span>
            <span className="text-[12px] font-semibold text-slate-900 dark:text-[#f5f5f5] truncate mt-0.5 leading-tight">
              {authorName}
            </span>
          </div>
        </a>

        {/* Right side: Saves metric (if present) */}
        {metrics?.saves !== undefined && metrics.saves > 0 && (
          <div className="flex items-center gap-1 font-semibold text-[11px] text-red-600 dark:text-red-400 shrink-0 ml-auto">
            <svg className="size-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{formatNumber(metrics.saves)}</span>
          </div>
        )}
      </div>
    </div>
  );
});
