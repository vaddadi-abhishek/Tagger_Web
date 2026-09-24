import React, { useState, useMemo } from "react";
import type { Bookmark, LinkedInCardData, MediaItem } from "../../types/bookmark";
import { sanitizeUrl, formatNumber, parseCardData } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { SafeImage } from "./SafeImage";
import { SafeVideo } from "./SafeVideo";
import {
  LinkedInBrandLogo,
  LinkedInReactionBadge,
} from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

interface LinkedInCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

export const LinkedInCard = React.memo(function LinkedInCard(props: LinkedInCardProps) {
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
    () => parseCardData<LinkedInCardData>(bookmark.card_data),
    [bookmark.card_data]
  );

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
    return list;
  }, [cardData?.media]);

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
    return null;
  }, [cardData?.media]);

  const [videoError, setVideoError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasMedia = Boolean(videoUrl || postImages.length > 0);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentSlide((prev) => Math.min(postImages.length - 1, prev + 1));
  };

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    // Interactive presentation viewer for LinkedIn documents/slides
    if (cardData?.document && postImages.length > 0) {
      return (
        <div className="relative w-full overflow-hidden border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-100 dark:bg-black group">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <SafeImage
              url={postImages[currentSlide] || postImages[0]}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black select-none"
            />
          </a>

          {postImages.length > 1 && (
            <>
              {currentSlide > 0 && (
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md z-10 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {currentSlide < postImages.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md z-10 cursor-pointer"
                  aria-label="Next slide"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium tracking-wide shadow-sm pointer-events-none">
                {currentSlide + 1} / {postImages.length}
              </div>
            </>
          )}
        </div>
      );
    }

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

  const subType = (cardData?.type || bookmark.type || "").toLowerCase();
  const typeBadge = useMemo(() => {
    if (subType === "linkedin_topic_collection") {
      return (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60">
          Topic Hub
        </span>
      );
    }
    if (subType === "linkedin_news_story") {
      return (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
          News Story
        </span>
      );
    }
    if (subType === "linkedin_newsletter") {
      return (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
          Newsletter
        </span>
      );
    }
    if (subType === "linkedin_article") {
      return (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
          Article
        </span>
      );
    }
    return null;
  }, [subType]);

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
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-semibold text-slate-900 dark:text-[#f3f6f8] text-[13.5px] truncate hover:underline cursor-pointer">
                {author?.name || "LinkedIn Member"}
              </span>
              {typeBadge}
            </div>
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
            onGenerateAiContext={onGenerateAiContext}
            isGeneratingAi={isGeneratingAi}
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
          className="block text-slate-900 dark:text-[#f3f6f8] group"
        >
          <ExpandableText
            text={bookmark.description || bookmark.title}
            className="text-[13px] leading-normal"
          />
        </a>
      </div>

      {/* Document details if present */}
      {cardData?.document && (
        <div className="px-3.5 pb-2.5">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-[#38434f] bg-slate-50/80 dark:bg-[#28323d]/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-[11px] shrink-0 uppercase tracking-tight">
                PDF
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {cardData.document.title || bookmark.title || "Document"}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {cardData.document.page_count ? `${cardData.document.page_count} pages` : `${postImages.length} pages`}
                </span>
              </div>
            </div>
            {cardData.document.pdf_url && (
              <a
                href={sanitizeUrl(cardData.document.pdf_url)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 shrink-0 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            )}
          </div>
        </div>
      )}

      {/* 3. Media: Video or Multi-Image Grid */}
      {hasMedia &&
        (videoUrl && !videoError ? (
          <div className="w-full border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-100 dark:bg-black">
            <SafeVideo
              key={videoUrl}
              src={videoUrl}
              poster={cardData?.video_thumbnail || postImages[0]}
              controls
              playsInline
              className="w-full max-h-[380px] object-contain bg-slate-100 dark:bg-black mx-auto block"
              onError={() => setVideoError(true)}
            />
          </div>
        ) : (
          renderImageGrid()
        ))}

      {/* 4. Reactions Metric row */}
      {(Boolean(metrics?.reactions && metrics.reactions > 0) ||
        Boolean(metrics?.comments && metrics.comments > 0) ||
        Boolean(metrics?.reposts && metrics.reposts > 0)) ? (
        <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-auto">
          <div className="flex items-center gap-1.5">
            {metrics?.reactions && metrics.reactions > 0 ? (
              <>
                <LinkedInReactionBadge className="w-4 h-4 shrink-0" />
                <span>{formatNumber(metrics.reactions)}</span>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {metrics?.comments && metrics.comments > 0 ? (
              <span>{formatNumber(metrics.comments)} comments</span>
            ) : null}
            {metrics?.reposts && metrics.reposts > 0 ? (
              <span>{formatNumber(metrics.reposts)} reposts</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
});
