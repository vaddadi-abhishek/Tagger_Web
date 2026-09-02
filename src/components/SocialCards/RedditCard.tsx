
import type { Bookmark, RedditCardData } from "../../types/bookmark";
import type { CollectionItem } from "../../types/collection";
import type { TagItem } from "../../types/tag";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";

interface RedditCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
  onRequestEditCollections?: (bookmark: Bookmark) => void;
  onRequestEditTags?: (bookmark: Bookmark) => void;
  availableCollections?: CollectionItem[];
  availableTags?: TagItem[];
}

export function RedditCard(props: RedditCardProps) {
  const { bookmark, availableTags, availableCollections, onToggleMenu, isMenuOpen, onRequestEdit, onRequestDelete, onRequestEditCollections, onRequestEditTags, onCloseMenu } = props;
  const cardData = bookmark.card_data as RedditCardData;
  const subreddit = cardData?.subreddit;
  const metrics = cardData?.metrics;

  const UpvoteIcon = () => (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-[1.125rem] h-[1.125rem] fill-current">
      <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.004.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8Z"></path>
    </svg>
  );

  const DownvoteIcon = () => (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-[1.125rem] h-[1.125rem] fill-current">
      <path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Z"></path>
    </svg>
  );

  const CommentIcon = () => (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-[1.125rem] h-[1.125rem] fill-current">
      <path d="M10 19H1.871a.886.886 0 0 1-.798-.52.886.886 0 0 1 .158-.941L3.1 15.771A9 9 0 1 1 10 19Zm-6.549-1.5H10a7.5 7.5 0 1 0-5.323-2.219l.54.545L3.451 17.5Z"></path>
    </svg>
  );

  const MoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
    </svg>
  );

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const getRelativeTime = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    return date.toLocaleDateString('en-US', options);
  };

  const BottomMetadata = () => (
    <div className="px-4 mt-2 mb-1 flex items-end justify-between min-h-[32px]">
      {/* Tags & Collections Row */}
      <div className="flex flex-wrap items-center gap-2 pr-2">
        {bookmark.tags?.map((tag, idx) => {
          const cleanTag = tag.replace(/^#/, "");
          const tagObj = availableTags?.find(
            (t) => t.name.toLowerCase().replace(/^#/, "") === cleanTag.toLowerCase()
          );
          const color = tagObj?.color;
          return (
            <span
              key={`tag-${idx}`}
              style={color ? { backgroundColor: `${color}18`, borderColor: `${color}50`, color: color } : undefined}
              className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#272729] dark:text-[#d7dadc] dark:border-[#343536]" : ""}`}
            >
              #{cleanTag}
            </span>
          );
        })}
        {bookmark.collections?.map((col, idx) => {
          const colObj = availableCollections?.find((c) => c.name.toLowerCase() === col.toLowerCase());
          const color = colObj?.color;
          return (
            <span
              key={`col-${idx}`}
              style={color ? { backgroundColor: `${color}18`, borderColor: `${color}50`, color: color } : undefined}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-xl border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#272729] dark:text-[#d7dadc] dark:border-[#343536]" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-3 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>
              {col}
            </span>
          );
        })}
      </div>

      {/* 3 Dots Menu Button aligned to right */}
      <div className="relative shrink-0 ml-auto">
        <button
          onClick={(e) => onToggleMenu?.(bookmark.id, e)}
          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#272729] dark:hover:text-[#d7dadc] transition-colors cursor-pointer text-slate-500 dark:text-[#818384] outline-none"
        >
          <MoreIcon />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 bottom-8 w-48 rounded-xl bg-white dark:bg-[#1a1a1b] border border-slate-200 dark:border-[#343536] shadow-lg z-40 text-[14px] font-medium text-slate-900 dark:text-[#d7dadc] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#272729] transition-colors">Edit bookmark</button>
            <button onClick={(e) => { e.stopPropagation(); onRequestEditCollections?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#272729] transition-colors">Edit Collections</button>
            <button onClick={(e) => { e.stopPropagation(); onRequestEditTags?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#272729] transition-colors">Edit Tags</button>
            <hr className="border-slate-200 dark:border-[#343536] my-1" />
            <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[#ff4500] transition-colors">Delete</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1a1b] text-slate-900 dark:text-[#d7dadc] font-sans rounded-[1.75rem] border border-slate-200/80 dark:border-[#343536] overflow-hidden pb-1 shadow-md">
      {/* Subreddit Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {subreddit?.icon_url ? (
            <img src={subreddit.icon_url} alt={subreddit.name} className="w-8 h-8 rounded-full bg-[var(--accent-bg)] object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#ff4500] flex items-center justify-center text-white shrink-0">
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M16.67,10A1.46,1.46,0,0,0,14.2,9a7.12,7.12,0,0,0-3.85-1.23L11.46,3.5,13.71,4A1.84,1.84,0,0,0,15.8,5.36a1.85,1.85,0,1,0-1.89-2.31l-2.43-.54a.39.39,0,0,0-.47.28L9.9,7.82A7.17,7.17,0,0,0,6,9a1.46,1.46,0,1,0-2.47,1A4.77,4.77,0,0,0,3.15,13a6.11,6.11,0,0,0,14,0A4.77,4.77,0,0,0,16.67,10Zm-10,3.75A1.56,1.56,0,1,1,8.23,12.2,1.56,1.56,0,0,1,6.67,13.75Zm4,2.5a5.53,5.53,0,0,1-3.62-1.26.4.4,0,0,1,.54-.6A4.6,4.6,0,0,0,10.67,15.5a4.65,4.65,0,0,0,3.08-1.11.4.4,0,0,1,.54.6A5.53,5.53,0,0,1,10.67,16.25Zm2.66-2.5A1.56,1.56,0,1,1,14.9,12.2,1.56,1.56,0,0,1,13.33,13.75Z" /></svg>
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden flex-1">
            <div className="flex items-center gap-1 text-[13px] truncate">
              <span className="font-bold text-slate-900 dark:text-[#d7dadc]">{subreddit?.name || 'Reddit'}</span>
              {getRelativeTime(cardData?.posted_at) && (
                <>
                  <span className="text-slate-500 dark:text-[#818384]">•</span>
                  <span className="text-slate-500 dark:text-[#818384]">{getRelativeTime(cardData?.posted_at)}</span>
                </>
              )}
            </div>
            <span className="text-[12px] text-slate-500 dark:text-[#818384] truncate">{cardData?.author ? `${cardData.author}` : ''}</span>
          </div>
        </div>

        {/* Top Right Logo */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-[#818384] shrink-0 self-start ml-2">
          <div className="p-1 transition-colors">
            {bookmark.logo ? (
              <img
                src={bookmark.logo}
                alt="Reddit Logo"
                className="w-6 h-6 object-contain rounded-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
                  }
                }}
              />
            ) : null}
            <div style={{ display: bookmark.logo ? "none" : "block" }}>
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-[#ff4500]">
                <path d="M16.67,10A1.46,1.46,0,0,0,14.2,9a7.12,7.12,0,0,0-3.85-1.23L11.46,3.5,13.71,4A1.84,1.84,0,0,0,15.8,5.36a1.85,1.85,0,1,0-1.89-2.31l-2.43-.54a.39.39,0,0,0-.47.28L9.9,7.82A7.17,7.17,0,0,0,6,9a1.46,1.46,0,1,0-2.47,1A4.77,4.77,0,0,0,3.15,13a6.11,6.11,0,0,0,14,0A4.77,4.77,0,0,0,16.67,10Zm-10,3.75A1.56,1.56,0,1,1,8.23,12.2,1.56,1.56,0,0,1,6.67,13.75Zm4,2.5a5.53,5.53,0,0,1-3.62-1.26.4.4,0,0,1,.54-.6A4.6,4.6,0,0,0,10.67,15.5a4.65,4.65,0,0,0,3.08-1.11.4.4,0,0,1,.54.6A5.53,5.53,0,0,1,10.67,16.25Zm2.66-2.5A1.56,1.56,0,1,1,14.9,12.2,1.56,1.56,0,0,1,13.33,13.75Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Title & Body */}
      <div className="px-4 pb-3 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
          <h3 className="font-bold text-[17px] text-slate-900 dark:text-[#d7dadc] leading-snug mb-1">{bookmark.title}</h3>
          {bookmark.description && (
            <ExpandableText
              text={bookmark.description}
              maxLength={150}
              className="text-[13px] opacity-80 leading-relaxed whitespace-pre-wrap break-words text-slate-700 dark:text-[#d7dadc]"
              buttonClassName="ml-1 text-[#ff4500] hover:underline"
            />
          )}
        </a>
      </div>

      {/* Media Snapshot (Only if it exists) */}
      {bookmark.snapshot && (
        <div className="px-4 pb-3">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
            <img src={bookmark.snapshot} alt="Media" className="w-full rounded-xl object-cover border border-slate-200 dark:border-[#343536] max-h-72" loading="lazy" />
          </a>
        </div>
      )}

      {/* Metrics Row */}
      <div className="px-4 pb-2 flex items-center gap-2 text-[12px] font-bold text-slate-800 dark:text-[#d7dadc] mt-auto pt-1">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#2a3236] rounded-full px-2 py-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-[#3d464b] transition-colors">
          <div className="hover:bg-[#ff4500]/20 rounded-full p-1 transition-colors hover:text-[#ff4500]">
            <UpvoteIcon />
          </div>
          {formatNumber(metrics?.upvotes) && <span className="mx-0.5">{formatNumber(metrics.upvotes)}</span>}
          <div className="hover:bg-[#7193ff]/20 rounded-full p-1 transition-colors hover:text-[#7193ff]">
            <DownvoteIcon />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#2a3236] rounded-full px-3 py-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-[#3d464b] transition-colors">
          <CommentIcon />
          {formatNumber(metrics?.comments) && <span>{formatNumber(metrics.comments)}</span>}
        </div>
      </div>
      <hr className="border-slate-200 dark:border-[#2f3336] mx-4 mt-2 mb-3" />
      <BottomMetadata />
    </div>
  );
}
