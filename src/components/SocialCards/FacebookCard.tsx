import React, { useState } from "react";
import type { Bookmark, FacebookCardData } from "../../types/bookmark";
import type { CollectionItem } from "../../types/collection";
import type { TagItem } from "../../types/tag";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { AIContextBadge } from "../AIContextBadge";

interface FacebookCardProps {
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

export function FacebookCard(props: FacebookCardProps) {
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
    availableTags,
  } = props;

  const cardData = bookmark.card_data as FacebookCardData;
  const author = cardData?.author;

  const getProxyUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `http://localhost:3000/api/v1/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const [snapshotSrc, setSnapshotSrc] = useState<string>(() =>
    bookmark.snapshot ? getProxyUrl(bookmark.snapshot) : ""
  );
  const [snapshotError, setSnapshotError] = useState(false);

  const handleSnapshotError = () => {
    if (snapshotSrc.includes("/proxy-image?url=") && bookmark.snapshot) {
      setSnapshotSrc(bookmark.snapshot);
    } else {
      setSnapshotError(true);
    }
  };

  const [avatarSrc, setAvatarSrc] = useState<string>(() =>
    author?.avatar_url ? getProxyUrl(author.avatar_url) : ""
  );
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = () => {
    if (avatarSrc.includes("/proxy-image?url=") && author?.avatar_url) {
      setAvatarSrc(author.avatar_url);
    } else {
      setAvatarError(true);
    }
  };

  // Exact Facebook Action SVGs matching reference image
  const LikeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );

  const CommentIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5V18" />
    </svg>
  );

  const FacebookBrandLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1877F2] shrink-0">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  const MoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
    </svg>
  );

  const BottomMetadata = () => (
    <div className="px-4 mt-2 mb-1 flex flex-col gap-2">
      <AIContextBadge context={bookmark.ai_context} className="mx-0 my-1" />
      <div className="flex items-end justify-between min-h-[32px]">
        {/* Tags & Collections Row */}
        <div className="flex flex-wrap items-center gap-2 pr-2">
          {bookmark.tags?.map((tag: string, idx: number) => {
            const cleanTag = tag.replace(/^#/, "");
            const tagObj = availableTags?.find(
              (t: TagItem) => t.name.toLowerCase().replace(/^#/, "") === cleanTag.toLowerCase()
            );
            const color = tagObj?.color;
            return (
              <span
                key={`tag-${idx}`}
                style={color ? { backgroundColor: `${color}18`, borderColor: `${color}50`, color: color } : undefined}
                className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#242526] dark:text-[#e4e6eb] dark:border-[#3a3b3c]" : ""}`}
              >
                #{cleanTag}
              </span>
            );
          })}
          {bookmark.collections?.map((col: string, idx: number) => {
            const colObj = availableCollections?.find((c: CollectionItem) => c.name.toLowerCase() === col.toLowerCase());
            const color = colObj?.color;
            return (
              <span
                key={`col-${idx}`}
                style={color ? { backgroundColor: `${color}18`, borderColor: `${color}50`, color: color } : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-xl border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#242526] dark:text-[#e4e6eb] dark:border-[#3a3b3c]" : ""}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-3 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                {col}
              </span>
            );
          })}
        </div>

        {/* 3 Dots Menu Button aligned to right */}
        <div className="relative shrink-0 ml-auto">
          <button
            onClick={(e) => onToggleMenu?.(bookmark.id, e)}
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#242526] dark:hover:text-[#e4e6eb] transition-colors cursor-pointer text-slate-500 dark:text-[#b0b3b8] outline-none"
          >
            <MoreIcon />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 bottom-8 w-48 rounded-xl bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3a3b3c] shadow-lg z-40 text-[14px] font-medium text-slate-900 dark:text-[#e4e6eb] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors">Edit bookmark</button>
              <button onClick={(e) => { e.stopPropagation(); onRequestEditCollections?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors">Edit Collections</button>
              <button onClick={(e) => { e.stopPropagation(); onRequestEditTags?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors">Edit Tags</button>
              <hr className="border-slate-200 dark:border-[#3a3b3c] my-1" />
              <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[#ff3040] transition-colors">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18191a] text-slate-900 dark:text-[#e4e6eb] font-sans rounded-[1.75rem] border border-slate-200/80 dark:border-[#2f3336] overflow-hidden pb-2 shadow-md">
      {/* Author Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {!avatarError && avatarSrc ? (
            <img
              src={avatarSrc}
              alt={author?.name || "Facebook User"}
              onError={handleAvatarError}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#242526] object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="font-bold text-slate-900 dark:text-[#e4e6eb] text-[15px] truncate">{author?.name || "Facebook User"}</span>
            {cardData?.posted_at && (
              <span className="text-[12px] text-slate-500 dark:text-[#b0b3b8] truncate mt-0.5">{cardData.posted_at}</span>
            )}
          </div>
        </div>

        {/* Facebook Brand Logo */}
        <div className="p-1 shrink-0">
          <FacebookBrandLogo />
        </div>
      </div>

      {/* Post Text Body */}
      <div className="px-4 pb-3 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block text-slate-900 dark:text-[#e4e6eb]">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            maxLength={180}
            className="text-[15px] leading-relaxed whitespace-pre-wrap break-words"
            buttonClassName="ml-1 text-[#1877F2] hover:underline"
          />
        </a>
      </div>

      {/* Media Snapshot */}
      {!snapshotError && snapshotSrc && (
        <div className="px-0 pb-2">
          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
            <img
              src={snapshotSrc}
              alt="Media"
              onError={handleSnapshotError}
              className="w-full object-cover max-h-80 border-y border-slate-200 dark:border-[#2f3336] bg-slate-100 dark:bg-[#242526]"
              loading="lazy"
            />
          </a>
        </div>
      )}

      {/* Facebook Action Bar */}
      <div className="px-4 flex items-center gap-6 text-slate-500 dark:text-[#b0b3b8] mt-auto">
        <button
          title="Like"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c]/50 hover:text-[#1877F2] transition-colors cursor-pointer outline-none"
        >
          <LikeIcon />
        </button>

        <button
          title="Comment"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c]/50 hover:text-slate-900 dark:hover:text-[#e4e6eb] transition-colors cursor-pointer outline-none"
        >
          <CommentIcon />
        </button>

        <button
          title="Share"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c]/50 hover:text-slate-900 dark:hover:text-[#e4e6eb] transition-colors cursor-pointer outline-none"
        >
          <ShareIcon />
        </button>
      </div>

      <hr className="border-slate-200 dark:border-[#2f3336] mx-4 my-1" />
      <BottomMetadata />
    </div>
  );
}
