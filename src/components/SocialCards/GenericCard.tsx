import React, { useState } from "react";
import type { Bookmark, GlobalWebCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { VerticalMoreIcon } from "./SocialCardIcons";
import { SafeImage } from "./SafeImage";

interface GenericCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
}

export const GenericCard = React.memo(function GenericCard(props: GenericCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onViewAiContext,
  } = props;

  const [logoError, setLogoError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const cardData = bookmark.card_data as GlobalWebCardData | undefined;
  const snapshotUrl = cardData?.snapshot || bookmark.snapshot;
  const mediaUrl = snapshotUrl || bookmark.logo;
  const descriptionText = bookmark.description || "";
  const DESCRIPTION_LIMIT = 130;
  const isLongDescription = descriptionText.length > DESCRIPTION_LIMIT;

  let domainFavicon = "";
  if (bookmark.url) {
    try {
      const hostname = new URL(bookmark.url).hostname;
      domainFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      // ignore parsing error
    }
  }
  const logoSrc = !logoError && bookmark.logo ? bookmark.logo : domainFavicon;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18181b] text-slate-900 dark:text-zinc-100 font-sans rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm pb-1">
      {/* Media Image Section */}
      {mediaUrl ? (
        <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 shrink-0">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full h-full"
          >
            <SafeImage
              url={mediaUrl}
              alt={bookmark.title}
              className="w-full h-full object-cover"
            />
          </a>

          {/* Top Right Source Logo Badge & Vertical 3-dots Menu */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            {logoSrc ? (
              <div className="size-7 rounded-full bg-white/90 dark:bg-black/75 backdrop-blur-md p-1 shadow-sm flex items-center justify-center border border-white/20">
                <img
                  src={logoSrc}
                  alt={bookmark.site_name || "Source Logo"}
                  onError={() => setLogoError(true)}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            ) : (
              <div className="rounded-full px-2 py-0.5 bg-black/60 backdrop-blur-md text-[9.5px] font-semibold text-white shadow-sm">
                <span>{bookmark.site_name}</span>
              </div>
            )}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleMenu?.(bookmark.id, e);
                }}
                title="More options"
                className="size-7 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer outline-none border border-white/20 shadow-sm flex items-center justify-center"
              >
                <VerticalMoreIcon />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl z-40 text-[12.5px] font-medium text-slate-900 dark:text-zinc-200 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAiContext?.(bookmark);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="size-3.5 shrink-0 opacity-70"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                      />
                    </svg>
                    <span>AI Context</span>
                  </button>
                  <hr className="border-slate-200 dark:border-zinc-800 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDelete?.(bookmark.id);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Card Body Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-start space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            {logoSrc && !mediaUrl && (
              <img
                src={logoSrc}
                alt=""
                className="size-3.5 object-contain rounded-full"
                onError={() => setLogoError(true)}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="font-semibold uppercase tracking-wider text-[10.5px] text-[var(--primary)]">
              {bookmark.site_name || "Web"}
            </span>
          </div>

          {/* If no media image, show 3-dots button in header */}
          {!mediaUrl && (
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleMenu?.(bookmark.id, e);
                }}
                title="More options"
                className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer text-slate-500 dark:text-zinc-400 outline-none"
              >
                <VerticalMoreIcon />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl z-40 text-[13px] font-medium text-slate-900 dark:text-zinc-200 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAiContext?.(bookmark);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="size-3.5 shrink-0 opacity-70"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                      />
                    </svg>
                    <span>AI Context</span>
                  </button>
                  <hr className="border-slate-200 dark:border-zinc-800 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDelete?.(bookmark.id);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] font-bold text-slate-900 dark:text-white hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors leading-snug block line-clamp-2"
        >
          {bookmark.title}
        </a>

        {descriptionText && (
          <div className="relative">
            <div
              className={`text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${
                isLongDescription && !isDescriptionExpanded
                  ? "max-h-12"
                  : "max-h-[600px]"
              }`}
            >
              <p>{descriptionText}</p>
            </div>

            {isLongDescription && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded((prev) => !prev);
                }}
                className="text-[var(--primary)] font-semibold text-[11px] mt-0.5 hover:underline cursor-pointer transition-all duration-200 active:scale-95 inline-flex items-center gap-1"
              >
                <span>
                  {isDescriptionExpanded ? "show less" : "show more..."}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Render Author if available from GlobalWebCardData */}
        {cardData?.author && (
          <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span>{cardData.author}</span>
          </div>
        )}
      </div>
    </div>
  );
});
