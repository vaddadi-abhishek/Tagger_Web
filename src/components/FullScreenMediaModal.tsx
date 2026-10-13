import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Bookmark } from "../types/bookmark";
import {
  extractMediaDetails,
  formatRelativeDate,
  sanitizeUrl,
  resolveCardType,
} from "../lib/utils";
import {
  XBrandLogo,
  InstagramBrandLogo,
  FacebookBrandLogo,
  RedditBrandLogo,
  LinkedInBrandLogo,
  YouTubeBrandLogo,
  PinterestBrandLogo,
  VerifiedBadge,
  FacebookVerifiedBadge,
} from "./SocialCards/SocialCardIcons";

export interface FullScreenMediaModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  initialIndex?: number;
  onClose: () => void;
}

export const FullScreenMediaModal: React.FC<FullScreenMediaModalProps> = ({
  isOpen,
  bookmark,
  initialIndex = 0,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setIsMenuOpen(false);
      setCopied(false);
      setIsDescriptionExpanded(false);
    }
  }, [isOpen, initialIndex]);

  const mediaItems = useMemo(() => {
    if (!bookmark) return [];
    return extractMediaDetails(bookmark);
  }, [bookmark]);

  // Keyboard navigation & dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        setIsMenuOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : prev));
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mediaItems.length, onClose]);

  const currentItem = mediaItems[activeIndex] || mediaItems[0];
  const isVideo = currentItem?.type === "video";

  const handleDownload = useCallback(async () => {
    if (!currentItem?.url) return;
    setIsMenuOpen(false);

    try {
      const response = await fetch(currentItem.url, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        const ext = isVideo ? "mp4" : "jpg";
        const site = (bookmark?.site_name || "mindspace").toLowerCase().replace(/[^a-z0-9]/g, "");
        a.download = `${site}_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
    } catch {
      // CORS or network error fallback
    }

    // Direct browser anchor fallback
    const a = document.createElement("a");
    a.href = currentItem.url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [currentItem, isVideo, bookmark]);

  const handleCopyLink = useCallback(async () => {
    if (!currentItem?.url) return;
    try {
      await navigator.clipboard.writeText(currentItem.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
    setIsMenuOpen(false);
  }, [currentItem]);

  if (!isOpen || !bookmark || mediaItems.length === 0) {
    return null;
  }

  const cardData = (typeof bookmark.card_data === "object" && bookmark.card_data !== null
    ? bookmark.card_data
    : {}) as Record<string, any>;
  const cardType = resolveCardType(bookmark);
  const author = cardData?.author || null;
  const authorName = author?.name || author?.username || bookmark.site_name || "MindSpace";
  const rawHandle = author?.handle || author?.username;
  const authorHandle = rawHandle
    ? rawHandle.startsWith("@")
      ? rawHandle
      : `@${rawHandle}`
    : null;
  const authorAvatar = author?.avatar_url || bookmark.logo || null;
  const isVerified = Boolean(author?.verified);
  const description = (bookmark.description || bookmark.title || "").trim();

  const renderPlatformLogo = () => {
    switch (cardType) {
      case "x":
        return <XBrandLogo className="w-3.5 h-3.5 fill-white shrink-0" />;
      case "instagram":
        return <InstagramBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "facebook":
        return <FacebookBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "reddit":
        return <RedditBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "linkedin":
        return <LinkedInBrandLogo className="w-3.5 h-3.5 fill-[#0a66c2] shrink-0" />;
      case "youtube":
        return <YouTubeBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      case "pinterest":
        return <PinterestBrandLogo className="w-3.5 h-3.5 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Top Bar: Close Button (Left), Index Counter (Center), 3-Dots Action Button (Right) */}
      <div className="relative z-30 w-full px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-auto">
        {/* Top-Left: Translucent Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-lg outline-none"
          title="Close (Esc)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="size-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Multi-Item Slide Index Badge */}
        {mediaItems.length > 1 && (
          <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/15 text-white text-xs font-semibold tracking-wider shadow-md">
            {activeIndex + 1} / {mediaItems.length}
          </div>
        )}

        {/* Top-Right: 3-Dots Action Menu Trigger & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-lg outline-none"
            title="Options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>

          {/* Floating Action Menu Dropdown */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#1C1917]/95 border border-white/15 shadow-2xl backdrop-blur-xl py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10 active:bg-white/15 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-4.5 text-amber-400 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  <span>{isVideo ? "Download Video" : "Download Image"}</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                {/* Copy Direct Media Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-4.5 text-slate-400 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625V10.875c0-.621.504-1.125 1.125-1.125h3.375m6 0h3.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125v-3.375m6-6v-3.375c0-.621-.504-1.125-1.125-1.125H10.875"
                    />
                  </svg>
                  <span>{copied ? "Link Copied!" : "Copy Media Link"}</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                {/* Open Original Post */}
                <a
                  href={sanitizeUrl(bookmark.url)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-4.5 text-slate-400 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  <span>Open Original Post</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Stage: Display Current Image or Playable Video with Carousel Controls */}
      <div className="relative flex-1 flex items-center justify-center w-full px-2 sm:px-6 min-h-0 overflow-hidden">
        {/* Previous Button (Multi-Slide Only) */}
        {mediaItems.length > 1 && activeIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => Math.max(0, prev - 1));
              setIsMenuOpen(false);
            }}
            className="absolute left-3 sm:left-6 z-20 size-11 sm:size-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-xl active:scale-95 outline-none"
            title="Previous (Left Arrow)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-6 -translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Media Canvas */}
        <div className="relative max-w-full max-h-full flex items-center justify-center p-2">
          {isVideo ? (
            <video
              key={currentItem.url}
              src={currentItem.url}
              poster={currentItem.posterUrl || undefined}
              controls
              autoPlay
              playsInline
              className="max-w-[92vw] max-h-[72vh] sm:max-h-[76vh] object-contain rounded-xl shadow-2xl mx-auto block bg-black"
            />
          ) : (
            <img
              key={currentItem.url}
              src={currentItem.url}
              alt={bookmark.title || "Fullscreen media"}
              className="max-w-[92vw] max-h-[72vh] sm:max-h-[76vh] object-contain select-none rounded-xl shadow-2xl mx-auto block"
              loading="eager"
            />
          )}
        </div>

        {/* Next Button (Multi-Slide Only) */}
        {mediaItems.length > 1 && activeIndex < mediaItems.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => Math.min(mediaItems.length - 1, prev + 1));
              setIsMenuOpen(false);
            }}
            className="absolute right-3 sm:right-6 z-20 size-11 sm:size-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-xl active:scale-95 outline-none"
            title="Next (Right Arrow)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-6 translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Description & Author Reels Overlay */}
      <div className="relative z-30 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-5 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
          {/* Author Header Row */}
          <div className="flex items-center gap-2.5">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="size-9 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
              />
            ) : (
              <div className="size-9 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-white/20">
                {(authorName || "M")[0].toUpperCase()}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-white text-[13.5px] sm:text-sm truncate">
                  {authorName}
                </span>
                {isVerified && (
                  cardType === "facebook" ? <FacebookVerifiedBadge className="size-3.5 shrink-0" /> : <VerifiedBadge className="size-3.5 shrink-0" />
                )}
                {renderPlatformLogo()}
              </div>
              {authorHandle && (
                <span className="text-[11.5px] text-white/70 truncate">
                  {authorHandle}
                  {cardData?.posted_at ? ` · ${formatRelativeDate(cardData.posted_at)}` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Caption / Description */}
          {description ? (
            <div className="text-[13px] sm:text-[13.5px] text-white/95 leading-relaxed">
              <p className={isDescriptionExpanded ? "whitespace-pre-line" : "line-clamp-2 whitespace-pre-line"}>
                {description}
              </p>
              {description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer mt-0.5 outline-none"
                >
                  {isDescriptionExpanded ? "Show less" : "...more"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
