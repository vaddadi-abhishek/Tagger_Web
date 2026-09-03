
import React from "react";
import type { Bookmark, InstagramCardData } from "../../types/bookmark";
import type { CollectionItem } from "../../types/collection";
import type { TagItem } from "../../types/tag";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { AIContextBadge } from "../AIContextBadge";

interface InstagramCardProps {
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

export function InstagramCard(props: InstagramCardProps) {
  const {
    bookmark,
    availableTags,
    availableCollections,
    onToggleMenu,
    isMenuOpen,
    onRequestEdit,
    onRequestDelete,
    onRequestEditCollections,
    onRequestEditTags,
    onCloseMenu,
  } = props;

  const cardData = bookmark.card_data as InstagramCardData;
  const author = cardData?.author;
  const metrics = cardData?.metrics;
  const logoUrl = bookmark.logo || (bookmark as any).logo_url;

  const ColoredInstagramLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
      <defs>
        <linearGradient id="ig-colored-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285aeb" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ig-colored-gradient)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );

  const LikeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  const RepostIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const BookmarkRibbonIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );

  const MoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
    </svg>
  );

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

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
                className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#262626] dark:text-[#f5f5f5] dark:border-[#363636]" : ""}`}
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
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-xl border ${!color ? "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#262626] dark:text-[#f5f5f5] dark:border-[#363636]" : ""}`}
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
          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#262626] dark:hover:text-[#f5f5f5] transition-colors cursor-pointer text-slate-500 dark:text-[#a8a8a8] outline-none"
        >
          <MoreIcon />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 bottom-8 w-48 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] shadow-lg z-40 text-[14px] font-medium text-slate-900 dark:text-[#f5f5f5] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button onClick={(e) => { e.stopPropagation(); onRequestEdit?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors">Edit bookmark</button>
            <button onClick={(e) => { e.stopPropagation(); onRequestEditCollections?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors">Edit Collections</button>
            <button onClick={(e) => { e.stopPropagation(); onRequestEditTags?.(bookmark); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors">Edit Tags</button>
            <hr className="border-slate-200 dark:border-[#262626] my-1" />
            <button onClick={(e) => { e.stopPropagation(); onRequestDelete?.(bookmark.id); onCloseMenu?.(); }} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-[#ff3040] transition-colors">Delete</button>
          </div>
        )}
      </div>
    </div>
  </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c0f14] text-slate-900 dark:text-[#f5f5f5] font-sans rounded-[1.75rem] border border-slate-200/80 dark:border-[#21262d] overflow-hidden pb-1 shadow-md">
      {/* Author Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] p-[2px] shrink-0">
              <img src={author.avatar_url} alt={author.name} className="w-full h-full rounded-full bg-white dark:bg-black object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#262626] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 opacity-60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden flex-1">
            <div className="flex items-center gap-1 truncate">
              <span className="font-bold text-[14px] text-slate-900 dark:text-[#f5f5f5] truncate">{author?.username || author?.name || "Instagram User"}</span>
              {author?.verified && (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0095F6] shrink-0">
                  <path d="M12.001 2.003L15.424 0l1.644 3.707 3.999.645-1.042 3.91 2.802 2.951-2.072 3.498 1.488 3.774-3.774 1.488-2.071 3.498-3.91-1.042-.646 3.998-3.707-1.644-2.853 2.502-1.745-3.66L0 19.336l2.36-3.23-2.07-3.499L2.359 9.11l-2.07-3.5L3.09 3.539l3.91 1.042.645-3.999 3.707 1.644 2.65-2.223zm-1.892 13.064l6.195-6.195-1.414-1.414-4.78 4.78-2.122-2.121-1.414 1.414 3.535 3.536z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Instagram Logo */}
        <div className="flex items-center gap-2 shrink-0 self-start ml-2">
          <div className="p-1">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Instagram Logo"
                className="w-6 h-6 object-contain rounded-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
                  }
                }}
              />
            ) : null}
            <div style={{ display: logoUrl ? "none" : "block" }}>
              <ColoredInstagramLogo />
            </div>
          </div>
        </div>
      </div>

      {/* Media Snapshot or Video Player */}
      {(() => {
        const videoMedia = cardData?.media?.find((m: any) => m && m.type === "video" && m.url);
        const videoUrl = videoMedia?.url;

        if (videoUrl) {
          return (
            <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
              <video
                src={videoUrl}
                poster={bookmark.snapshot || undefined}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          );
        }

        if (bookmark.snapshot) {
          return (
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
              <img src={bookmark.snapshot} alt="Media" className="w-full aspect-[4/5] object-cover bg-black" loading="lazy" />
            </a>
          );
        }

        return null;
      })()}

      {/* Native Instagram Action Bar */}
      <div className="px-4 pt-3 flex items-center justify-between text-slate-900 dark:text-[#f5f5f5]">
        <div className="flex items-center gap-4">
          <div className="hover:opacity-60 transition-opacity cursor-pointer">
            <LikeIcon />
          </div>
          <div className="hover:opacity-60 transition-opacity cursor-pointer">
            <CommentIcon />
          </div>
          <div className="flex items-center gap-1 hover:opacity-60 transition-opacity cursor-pointer">
            <RepostIcon />
            {(metrics as any)?.reposts ? <span className="text-[14px] font-semibold">{formatNumber((metrics as any).reposts)}</span> : null}
          </div>
          <div className="hover:opacity-60 transition-opacity cursor-pointer">
            <ShareIcon />
          </div>
        </div>
        <div className="hover:opacity-60 transition-opacity cursor-pointer">
          <BookmarkRibbonIcon />
        </div>
      </div>

      {/* Likes Count */}
      <div className="px-4 pt-2 text-[14px] font-bold text-slate-900 dark:text-[#f5f5f5]">
        {metrics?.likes ? (
          <span>{formatNumber(metrics.likes)} likes</span>
        ) : (
          <span>
            Liked by <span className="font-bold">igaharwar__</span> and <span className="font-bold">others</span>
          </span>
        )}
      </div>

      {/* Caption with Bold Inline Username */}
      <div className="px-4 pb-2 pt-1 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            prefix={
              <span className="font-bold text-slate-900 dark:text-[#f5f5f5] inline-flex items-center gap-1 mr-1.5">
                <span>{author?.username || author?.name || "user"}</span>
                {author?.verified && (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0095F6] inline shrink-0">
                    <path d="M12.001 2.003L15.424 0l1.644 3.707 3.999.645-1.042 3.91 2.802 2.951-2.072 3.498 1.488 3.774-3.774 1.488-2.071 3.498-3.91-1.042-.646 3.998-3.707-1.644-2.853 2.502-1.745-3.66L0 19.336l2.36-3.23-2.07-3.499L2.359 9.11l-2.07-3.5L3.09 3.539l3.91 1.042.645-3.999 3.707 1.644 2.65-2.223zm-1.892 13.064l6.195-6.195-1.414-1.414-4.78 4.78-2.122-2.121-1.414 1.414 3.535 3.536z" />
                  </svg>
                )}
              </span>
            }
            maxLength={160}
            className="text-[14px] leading-snug break-words text-slate-900 dark:text-[#f5f5f5]"
            buttonClassName="ml-1 text-slate-500 hover:text-slate-900 dark:text-[#a8a8a8] dark:hover:text-white font-semibold"
          />
        </a>
      </div>

      <hr className="border-slate-200 dark:border-[#21262d] mx-4 my-1" />
      <BottomMetadata />
    </div>
  );
}

