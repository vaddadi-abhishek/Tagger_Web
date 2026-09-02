import { useState } from "react";
import type { Bookmark, GlobalWebCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";

export function GenericCard({ bookmark }: { bookmark: Bookmark }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const mediaUrl = bookmark.snapshot || bookmark.logo;
  const descriptionText = bookmark.description || "";
  const DESCRIPTION_LIMIT = 110;
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

  return (
    <>
      {/* Media Image Section */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[var(--bg)] shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[var(--border)] opacity-50 animate-pulse" />
        )}

        {!imgError && mediaUrl ? (
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
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--accent-bg)] text-[var(--text)] p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-8 opacity-40 mb-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V6.75z"
              />
            </svg>
            <span className="text-[11px] opacity-70 font-medium">
              {bookmark.site_name}
            </span>
          </div>
        )}

        {/* Top Right Source Logo Badge */}
        {logoSrc ? (
          <div className="absolute top-3 right-3 size-8.5 rounded-full bg-white/90 dark:bg-black/75 backdrop-blur-md p-1.5 shadow-lg z-10 flex items-center justify-center border border-white/20">
            <img
              src={logoSrc}
              alt={bookmark.site_name || "Source Logo"}
              onError={() => setLogoError(true)}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        ) : (
          <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white shadow-md z-10">
            <span>{bookmark.site_name}</span>
          </div>
        )}
      </div>

      {/* Card Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-start space-y-3">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="text-base font-bold text-[var(--text-h)] hover:text-[var(--primary)] transition-colors leading-snug block line-clamp-2"
        >
          {bookmark.title}
        </a>

        {descriptionText && (
          <div className="relative">
            <div
              className={`text-xs text-[var(--text)] leading-relaxed opacity-90 transition-all duration-300 ease-in-out overflow-hidden ${
                isLongDescription && !isDescriptionExpanded
                  ? "max-h-11"
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
            <div className="text-[11px] text-[var(--text)] opacity-75 mt-2 flex items-center gap-1.5 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                {cardData.author}
            </div>
        )}
      </div>
    </>
  );
}
