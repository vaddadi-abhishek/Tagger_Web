
import React from "react";
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1b1f23] text-slate-900 dark:text-[#e8e9ea] font-sans rounded-[1.75rem] border border-slate-200/80 dark:border-[#38434f] overflow-hidden pb-1 shadow-md">
      {/* Author Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt={author.name} className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#28323d] object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#28323d] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden flex-1">
            <span className="font-bold text-slate-900 dark:text-[#e8e9ea] text-[14px] truncate">{author?.name || 'LinkedIn Member'}</span>
            {author?.headline && <span className="text-[12px] text-slate-500 dark:text-[#8e959e] truncate mt-0.5">{author.headline}</span>}
          </div>
        </div>

        {/* Top Right Logo & Vertical 3-dots Menu */}
        <div className="flex items-center gap-1.5 shrink-0 self-start ml-2">
          <div className="p-1">
            <LinkedInLogo />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#28323d] dark:hover:text-[#e8e9ea] transition-colors cursor-pointer text-slate-500 dark:text-[#8e959e] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#1b1f23] border border-slate-200 dark:border-[#38434f] shadow-lg z-40 text-[14px] font-medium text-slate-900 dark:text-[#e8e9ea] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#28323d] transition-colors">Edit bookmark</button>
                <hr className="border-slate-200 dark:border-[#38434f] my-1" />
                <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[#ff4500] transition-colors">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Body */}
      <div className="px-4 pb-3 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e8e9ea]">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={180}
            className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-slate-900 dark:text-[#e8e9ea]"
            buttonClassName="ml-1 text-[#0a66c2] dark:text-[#70b5f9] font-semibold hover:underline"
          />
        </a>
      </div>

      {/* Media Snapshot */}
      {bookmark.snapshot && (
        <div className="px-0 pb-3">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
            <img src={bookmark.snapshot} alt="Media" className="w-full object-cover max-h-72 border-y border-slate-200 dark:border-[#38434f]/50 bg-slate-100 dark:bg-[#1b1f23]" loading="lazy" />
          </a>
        </div>
      )}

      {/* Native LinkedIn Action Bar */}
      <div className="px-2 py-2 flex items-center justify-around text-[12px] font-semibold text-slate-600 dark:text-[#8e959e] border-t border-slate-200 dark:border-[#38434f]/40 mt-auto">
        <div className="flex items-center gap-1.5 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <LikeIcon />
          <span>{metrics?.reactions ? formatNumber(metrics.reactions) : "Like"}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <CommentIcon />
          <span>{metrics?.comments ? formatNumber(metrics.comments) : "Comment"}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <RepostIcon />
          <span>{metrics?.reposts ? formatNumber(metrics.reposts) : "Repost"}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#0a66c2] dark:hover:text-[#70b5f9] transition-colors cursor-pointer px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#28323d]/50">
          <SendIcon />
          <span>Send</span>
        </div>
      </div>
    </div>
  );
}


