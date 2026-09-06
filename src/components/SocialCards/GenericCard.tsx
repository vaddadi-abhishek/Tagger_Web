import React, { useState } from "react";
import type { Bookmark, GlobalWebCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";

interface GenericCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

export function GenericCard(props: GenericCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onRequestEdit,
  } = props;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const mediaUrl = bookmark.snapshot || bookmark.logo;
  const descriptionText = bookmark.description || "";
  const DESCRIPTION_LIMIT = 130;
  const isLongDescription = descriptionText.length > DESCRIPTION_LIMIT;

  let domainFavicon = "";
  if (bookmark.url) {
    try {
      const hostname = new URL(bookmark.url).hostname;
      domainFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {}
  }
  const logoSrc = !logoError && bookmark.logo ? bookmark.logo : domainFavicon;
  const cardData = bookmark.card_data as GlobalWebCardData | undefined;

  const VerticalMoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18181b] text-slate-900 dark:text-zinc-100 font-sans rounded-[1.75rem] border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-md pb-1">
      {/* Media Image Section */}
      {mediaUrl && !imgError ? (
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 opacity-60 animate-pulse" />
          )}

          <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block w-full h-full">
            <img
              src={mediaUrl}
              alt={bookmark.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            />
          </a>

          {/* Top Right Source Logo Badge & Vertical 3-dots Menu */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {logoSrc ? (
              <div className="size-8 rounded-full bg-white/90 dark:bg-black/75 backdrop-blur-md p-1.5 shadow-md flex items-center justify-center border border-white/20">
                <img
                  src={logoSrc}
                  alt={bookmark.site_name || "Source Logo"}
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            ) : (
              <div className="rounded-full px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white shadow-md">
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
                className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer outline-none border border-white/20 shadow-md flex items-center justify-center"
              >
                <VerticalMoreIcon />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl z-40 text-[13px] font-medium text-slate-900 dark:text-zinc-200 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestEdit?.(bookmark);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <span>Edit bookmark</span>
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
          </div>
        </div>
      ) : null}

      {/* Card Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-start space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            {logoSrc && (!mediaUrl || imgError) && (
              <img
                src={logoSrc}
                alt=""
                className="size-4 object-contain rounded-full"
                onError={() => setLogoError(true)}
              />
            )}
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--primary)]">
              {bookmark.site_name || "Web"}
            </span>
          </div>

          {/* If no media image, show 3-dots button in header */}
          {(!mediaUrl || imgError) && (
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
                      onRequestEdit?.(bookmark);
                      onCloseMenu?.();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <span>Edit bookmark</span>
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
          className="text-base font-bold text-slate-900 dark:text-white hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors leading-snug block line-clamp-2"
        >
          {bookmark.title}
        </a>

        {descriptionText && (
          <div className="relative">
            <div
              className={`text-[13px] text-slate-600 dark:text-zinc-300 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${
                isLongDescription && !isDescriptionExpanded
                  ? "max-h-14"
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
                className="text-[var(--primary)] font-semibold text-xs mt-1 hover:underline cursor-pointer transition-all duration-200 active:scale-95 inline-flex items-center gap-1"
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
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span>{cardData.author}</span>
          </div>
        )}
      </div>
    </div>
  );
}
