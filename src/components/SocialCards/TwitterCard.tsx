import type { Bookmark, XCardData } from "../../types/bookmark";
import type { CollectionItem } from "../../types/collection";
import type { TagItem } from "../../types/tag";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { AIContextBadge } from "../AIContextBadge";

interface TwitterCardProps {
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

export function TwitterCard(props: TwitterCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onRequestEdit,
    onRequestEditCollections,
    onRequestEditTags,
    availableCollections,
    availableTags
  } = props;
  const cardData = bookmark.card_data as XCardData;
  const author = cardData?.author;
  const metrics = cardData?.metrics;
  const hasMedia = !!bookmark.snapshot;

  // Exact Twitter SVGs
  const ReplyIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
  );

  const RepostIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></svg>
  );

  const LikeIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></svg>
  );

  const BookmarkIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></svg>
  );

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
  );

  const VerifiedIcon = () => (
    <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-[1.125rem] h-[1.125rem] shrink-0 fill-[#1d9bf0]">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.084.34-.13.69-.13 1.05 0 2.21 1.71 4 3.918 4 .58 0 1.13-.153 1.616-.425 1.492 1.253 3.39 2 5.466 2 2.076 0 3.973-.747 5.466-2 .486.272 1.036.425 1.616.425 2.21 0 3.918-1.792 3.918-4 0-.36-.046-.71-.13-1.05 1.105-.704 1.846-1.99 1.846-3.45z"></path>
      <path fill="black" d="M10.67 15.266L7.336 12l1.378-1.42 1.956 1.897 4.542-4.66 1.42 1.378-5.963 6.07z"></path>
    </svg>
  );

  const XIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.25rem] h-[1.25rem] fill-slate-900 dark:fill-[#e7e9ea] shrink-0">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
  );

  const MoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1.125rem] h-[1.125rem] fill-current"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
  );


  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleText = author?.handle ? (author.handle.startsWith('@') ? author.handle : `@${author.handle}`) : '';

  // Calculate relative time for feed view (e.g. "8h" or "Jul 5")
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

  const formatDetailDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    const timeStr = date.toLocaleTimeString('en-US', timeOptions);
    const dateStr = date.toLocaleDateString('en-US', dateOptions);
    return `${timeStr} · ${dateStr}`;
  };

  const BottomMetadata = () => (
    <div className="px-4 mt-2 mb-1 flex flex-col gap-2">
      <AIContextBadge context={bookmark.ai_context} className="mx-0 my-1" />
      <div className="flex items-end justify-between min-h-[32px]">
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
              className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#16181c] dark:text-[#e7e9ea] dark:border-[#2f3336]" : ""}`}
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
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-xl border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#16181c] dark:text-[#e7e9ea] dark:border-[#2f3336]" : ""}`}
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
          className="p-1.5 rounded-lg hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer text-slate-500 dark:text-[#71767b] outline-none"
        >
          <MoreIcon />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 bottom-8 w-48 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-[#2f3336] shadow-lg z-40 text-[14px] font-medium text-slate-900 dark:text-[#e7e9ea] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#16181c] transition-colors">Edit bookmark</button>
            <button onClick={(e) => { e.stopPropagation(); onRequestEditCollections?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#16181c] transition-colors">Edit Collections</button>
            <button onClick={(e) => { e.stopPropagation(); onRequestEditTags?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#16181c] transition-colors">Edit Tags</button>
            <hr className="border-slate-200 dark:border-[#2f3336] my-1" />
            <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[#f4212e] transition-colors">Delete</button>
          </div>
        )}
      </div>
    </div>
  </div>
  );

  // ---------------------------------------------------------------------------
  // FEED VIEW (For Cards with Media)
  // ---------------------------------------------------------------------------
  if (hasMedia) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#e7e9ea] font-sans pb-3 rounded-[1.75rem] border border-slate-200/80 dark:border-[#2f3336] overflow-hidden shadow-md">
        {/* Header Inline */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#16181c] object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#16181c] shrink-0" />
            )}
            <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-[15px]">
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea] truncate">{author?.name || 'X User'}</span>
              {author?.verified && <VerifiedIcon />}
              <span className="text-slate-500 dark:text-[#71767b] truncate">{handleText}</span>
              {getRelativeTime(cardData?.posted_at) && (
                <>
                  <span className="text-slate-500 dark:text-[#71767b]">·</span>
                  <span className="text-slate-500 dark:text-[#71767b]">{getRelativeTime(cardData?.posted_at)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-[#71767b] shrink-0">
            <div className="p-2 transition-colors">
              <XIcon />
            </div>
          </div>
        </div>

        {/* Tweet Body */}
        <div className="px-4 mt-2">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e7e9ea]">
            <ExpandableText
              text={bookmark.description || bookmark.title}
              maxLength={200}
              className="text-[15px] leading-normal whitespace-pre-wrap break-words"
              buttonClassName="ml-1 text-[#1d9bf0] hover:underline"
            />
          </a>
        </div>

        {/* Media */}
        {(() => {
          const videoMedia = cardData?.media?.find((m: any) => m && m.type === "video" && m.url);
          const videoUrl = videoMedia?.url;

          if (videoUrl) {
            return (
              <div className="px-4 mt-3">
                <video
                  src={videoUrl}
                  poster={bookmark.snapshot || undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full rounded-2xl object-cover border border-slate-200 dark:border-[#2f3336] max-h-80 bg-black"
                />
              </div>
            );
          }

          if (bookmark.snapshot) {
            return (
              <div className="px-4 mt-3">
                <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
                  <img src={bookmark.snapshot} alt="Media" className="w-full rounded-2xl object-cover border border-slate-200 dark:border-[#2f3336] max-h-80" loading="lazy" />
                </a>
              </div>
            );
          }

          return null;
        })()}

        <hr className="border-slate-200 dark:border-[#2f3336] mx-4 mt-4" />

        {/* Action Row */}
        <div className="px-4 mt-3 flex justify-between items-center text-slate-500 dark:text-[#71767b] max-w-[425px]">
          <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[13px]">
            <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-1.5"><ReplyIcon /></div>
            {formatNumber(metrics?.replies) && <span>{formatNumber(metrics.replies)}</span>}
          </div>
          <div className="flex items-center gap-1.5 hover:text-[#00ba7c] transition-colors cursor-pointer group/action text-[13px]">
            <div className="p-1.5 rounded-full group-hover/action:bg-[#00ba7c]/10 transition-colors -ml-1.5"><RepostIcon /></div>
            {formatNumber(metrics?.reposts) && <span>{formatNumber(metrics.reposts)}</span>}
          </div>
          <div className="flex items-center gap-1.5 hover:text-[#f91880] transition-colors cursor-pointer group/action text-[13px]">
            <div className="p-1.5 rounded-full group-hover/action:bg-[#f91880]/10 transition-colors -ml-1.5"><LikeIcon /></div>
            {formatNumber(metrics?.likes) && <span>{formatNumber(metrics.likes)}</span>}
          </div>
          <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[13px]">
            <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-1.5"><BookmarkIcon /></div>
          </div>
          <div className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action">
            <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors"><ShareIcon /></div>
          </div>
        </div>
        <hr className="border-slate-200 dark:border-[#2f3336] mx-4 mt-3" />
        <BottomMetadata />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // DETAIL VIEW (For Cards without Media)
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#e7e9ea] font-sans pb-3 rounded-[1.75rem] border border-slate-200/80 dark:border-[#2f3336] overflow-hidden shadow-md">
      {/* Header Stacked */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt={author.name} className="w-11 h-11 rounded-full bg-slate-200 dark:bg-[#16181c] object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-[#16181c] shrink-0" />
          )}
          <div className="flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea] text-[15px] truncate">{author?.name || 'X User'}</span>
              {author?.verified && <VerifiedIcon />}
            </div>
            <span className="text-slate-500 dark:text-[#71767b] text-[15px] leading-tight truncate">{handleText}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 dark:text-[#71767b] shrink-0 relative">
          <div className="p-2 transition-colors hidden sm:block">
            <XIcon />
          </div>
        </div>
      </div>

      {/* Tweet Body - Slightly larger for detail view */}
      <div className="px-4 mt-3">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e7e9ea]">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={300}
            className="text-[17px] leading-normal whitespace-pre-wrap break-words"
            buttonClassName="ml-1 text-[#1d9bf0] hover:underline"
          />
        </a>
      </div>

      {/* Date Row */}
      {formatDetailDate(cardData?.posted_at) && (
        <div className="px-4 mt-4">
          <div className="flex flex-wrap items-center gap-1 text-[15px] text-slate-500 dark:text-[#71767b]">
            <span>{formatDetailDate(cardData?.posted_at)}</span>
            {metrics?.views ? (
              <>
                <span>·</span>
                <span className="font-bold text-slate-900 dark:text-[#e7e9ea] ml-0.5">{formatNumber(metrics.views)}</span>
                <span>Views</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      <hr className="border-slate-200 dark:border-[#2f3336] mx-4 mt-3" />

      {/* Action Row */}
      <div className="px-4 py-3 flex justify-between items-center text-slate-500 dark:text-[#71767b]">
        <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-2"><ReplyIcon /></div>
          {formatNumber(metrics?.replies) && <span>{formatNumber(metrics.replies)}</span>}
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#00ba7c] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#00ba7c]/10 transition-colors -ml-2"><RepostIcon /></div>
          {formatNumber(metrics?.reposts) && <span>{formatNumber(metrics.reposts)}</span>}
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#f91880] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#f91880]/10 transition-colors -ml-2"><LikeIcon /></div>
          {formatNumber(metrics?.likes) && <span>{formatNumber(metrics.likes)}</span>}
        </div>
        <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[15px]">
          <div className="p-2 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-2"><BookmarkIcon /></div>
          {formatNumber(metrics?.bookmarks) && <span>{formatNumber(metrics.bookmarks)}</span>}
        </div>
        <div className="flex items-center hover:text-[#1d9bf0] transition-colors cursor-pointer group/action">
          <div className="p-2 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors"><ShareIcon /></div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-[#2f3336] mx-4 mb-1" />
      <BottomMetadata />
    </div>
  );
}
