import React, { useState } from "react";
import type { Bookmark, InstagramCardData } from "../../types/bookmark";
import { sanitizeUrl } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { CarouselNavButtons } from "./CarouselNavButtons";

interface InstagramCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

function InstagramImageItem({
  url,
  alt = "Instagram post media",
  className = "w-full h-auto max-h-[380px] object-contain mx-auto block",
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const getProxyUrl = (raw?: string | null) => {
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    return `${baseUrl}/proxy-image?url=${encodeURIComponent(raw)}`;
  };

  const [src, setSrc] = useState<string>(() => url);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setSrc(url);
    setHasError(false);
  }, [url]);

  const handleError = () => {
    if (src === url && url && !url.includes("/proxy-image?url=")) {
      setSrc(getProxyUrl(url));
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-72 bg-slate-100 dark:bg-[#16181c] flex items-center justify-center text-slate-400 dark:text-slate-600">
        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      loading="lazy"
      {...({ referrerPolicy: "no-referrer" } as any)}
      className={className}
    />
  );
}

function formatInstagramDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return null;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} MINUTES AGO`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "HOUR" : "HOURS"} AGO`;
    }
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "DAY" : "DAYS"} AGO`;
    }
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
      .toUpperCase();
  } catch {
    return null;
  }
}

export function InstagramCard(props: InstagramCardProps) {
  const {
    bookmark,
    onToggleMenu,
    isMenuOpen,
    onRequestEdit,
    onRequestDelete,
    onCloseMenu,
  } = props;

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Reset active slide index when card switches
  React.useEffect(() => {
    setActiveMediaIdx(0);
  }, [bookmark.id]);

  const rawCardData = bookmark.card_data;
  const cardData: InstagramCardData | null = React.useMemo(() => {
    if (!rawCardData) return null;
    if (typeof rawCardData === "string") {
      try {
        return JSON.parse(rawCardData);
      } catch {
        return null;
      }
    }
    return rawCardData as InstagramCardData;
  }, [rawCardData]);

  const author = cardData?.author || (bookmark as any)?.author;
  const metrics = cardData?.metrics || (bookmark as any)?.metrics;
  const logoUrl = bookmark.logo || (bookmark as any).logo_url;

  const [avatarSrc, setAvatarSrc] = useState<string>(() => author?.avatar_url || "");
  const [avatarError, setAvatarError] = useState(false);

  React.useEffect(() => {
    setAvatarSrc(author?.avatar_url || "");
    setAvatarError(false);
  }, [author?.avatar_url]);

  const handleAvatarError = () => {
    if (avatarSrc === author?.avatar_url && author?.avatar_url && !author.avatar_url.includes("/proxy-image?url=")) {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
      setAvatarSrc(`${baseUrl}/proxy-image?url=${encodeURIComponent(author.avatar_url)}`);
    } else {
      setAvatarError(true);
    }
  };

  // Comprehensive media extraction supporting images array, media array, carousels, and snapshot
  const mediaItems: Array<{ type: "image" | "video"; url: string }> = React.useMemo(() => {
    const items: Array<{ type: "image" | "video"; url: string }> = [];
    const seenUrls = new Set<string>();

    const addItem = (rawItem: any, defaultType: "image" | "video" = "image") => {
      if (!rawItem) return;
      let url = "";
      let type: "image" | "video" = defaultType;

      if (typeof rawItem === "string") {
        url = rawItem.trim();
        if (
          url.includes(".mp4") ||
          url.includes("/reel/") ||
          url.includes("/video/") ||
          url.includes("video_url")
        ) {
          type = "video";
        }
      } else if (typeof rawItem === "object") {
        url = (
          rawItem.url ||
          rawItem.src ||
          rawItem.display_url ||
          rawItem.video_url ||
          rawItem.media_url ||
          rawItem.image_url ||
          ""
        ).trim();

        if (
          rawItem.type === "video" ||
          rawItem.is_video === true ||
          Boolean(rawItem.video_url) ||
          url.includes(".mp4")
        ) {
          type = "video";
        }
      }

      if (!url || seenUrls.has(url)) return;
      // Filter out avatar or icon matches
      if (
        url.includes("150x150") ||
        url.includes("s150x150") ||
        url.includes("profile_pic") ||
        url.includes("avatar")
      ) {
        return;
      }

      seenUrls.add(url);
      items.push({ type, url });
    };

    // 1. Check card_data.images (all carousel URLs available in card_data images in json structure)
    const rawImages =
      (cardData as any)?.images ||
      (bookmark as any)?.images ||
      (bookmark as any)?.card_data?.images;
    if (Array.isArray(rawImages)) {
      for (const img of rawImages) {
        addItem(img, "image");
      }
    }

    // 2. Check card_data.media
    const rawMedia =
      cardData?.media ||
      (bookmark as any)?.media ||
      (bookmark as any)?.card_data?.media;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        addItem(m);
      }
    }

    // 3. Check carousel / carousel_media / sidecar / edge_sidecar_to_children
    const rawCarousel =
      (cardData as any)?.carousel ||
      (cardData as any)?.carousel_media ||
      (cardData as any)?.sidecar ||
      (cardData as any)?.edge_sidecar_to_children?.edges;
    if (Array.isArray(rawCarousel)) {
      for (const c of rawCarousel) {
        if (c?.node) {
          addItem(c.node);
        } else {
          addItem(c);
        }
      }
    }

    // 4. Check photos and mediaURLs
    const rawPhotos = (cardData as any)?.photos;
    if (Array.isArray(rawPhotos)) {
      for (const p of rawPhotos) {
        addItem(p, "image");
      }
    }

    const rawMediaURLs = (cardData as any)?.mediaURLs;
    if (Array.isArray(rawMediaURLs)) {
      for (const u of rawMediaURLs) {
        addItem(u);
      }
    }

    // 5. Check direct single video fields
    const singleVideo =
      (cardData as any)?.video_url ||
      (cardData as any)?.videoUrl ||
      (cardData as any)?.video?.url ||
      (bookmark as any)?.video_url;
    if (singleVideo) {
      addItem(singleVideo, "video");
    }

    // 6. Fallback to snapshot if items is still empty
    if (items.length === 0 && bookmark.snapshot) {
      const isSnapVideo =
        bookmark.snapshot.includes(".mp4") ||
        bookmark.snapshot.includes("/reel/") ||
        bookmark.snapshot.includes("/video/");
      addItem(bookmark.snapshot, isSnapVideo ? "video" : "image");
    }

    return items;
  }, [cardData, bookmark]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMediaIdx((prev) => (prev < mediaItems.length - 1 ? prev + 1 : prev));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45 && activeMediaIdx < mediaItems.length - 1) {
      setActiveMediaIdx((prev) => prev + 1);
    } else if (diff < -45 && activeMediaIdx > 0) {
      setActiveMediaIdx((prev) => prev - 1);
    }
    setTouchStartX(null);
  };

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

  const VerticalMoreIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  const formatNumber = (num?: number) => {
    if (!num || num <= 0) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c0f14] text-slate-900 dark:text-[#f5f5f5] font-sans rounded-2xl border border-slate-200/80 dark:border-[#21262d] overflow-hidden pb-1 shadow-sm">
      {/* Author Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {!avatarError && avatarSrc ? (
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] p-[1.5px] shrink-0">
              <img
                src={avatarSrc}
                alt={author?.username || author?.name || "Instagram User"}
                onError={handleAvatarError}
                {...({ referrerPolicy: "no-referrer" } as any)}
                className="w-full h-full rounded-full bg-white dark:bg-black object-cover"
              />
            </div>
          ) : (
            <div className="w-8.5 h-8.5 rounded-full bg-slate-200 dark:bg-[#262626] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 opacity-60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col leading-tight overflow-hidden flex-1">
            <div className="flex items-center gap-1 truncate">
              <span className="font-bold text-[13px] text-slate-900 dark:text-[#f5f5f5] truncate">
                {author?.username || author?.name || "Instagram User"}
              </span>
              {author?.verified && (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0095F6] shrink-0">
                  <path d="M12.001 2.003L15.424 0l1.644 3.707 3.999.645-1.042 3.91 2.802 2.951-2.072 3.498 1.488 3.774-3.774 1.488-2.071 3.498-3.91-1.042-.646 3.998-3.707-1.644-2.853 2.502-1.745-3.66L0 19.336l2.36-3.23-2.07-3.499L2.359 9.11l-2.07-3.5L3.09 3.539l3.91 1.042.645-3.999 3.707 1.644 2.65-2.223zm-1.892 13.064l6.195-6.195-1.414-1.414-4.78 4.78-2.122-2.121-1.414 1.414 3.535 3.536z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Instagram Logo + Menu */}
        <div className="flex items-center gap-1.5 shrink-0 self-start ml-2">
          <div className="p-0.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Instagram Logo"
                className="w-5 h-5 object-contain rounded-sm"
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
          <div className="relative shrink-0">
            <button
              onClick={(e) => onToggleMenu?.(bookmark.id, e)}
              className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#262626] dark:hover:text-[#f5f5f5] transition-colors cursor-pointer text-slate-500 dark:text-[#a8a8a8] outline-none"
              title="More options"
            >
              <VerticalMoreIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] shadow-lg z-40 text-[13px] font-medium text-slate-900 dark:text-[#f5f5f5] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEdit?.(bookmark);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors"
                >
                  Edit bookmark
                </button>
                <hr className="border-slate-200 dark:border-[#262626] my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete?.(bookmark.id);
                    onCloseMenu?.();
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-[#ff3040] transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Carousel or Single Media (Full Uncropped Rendering) */}
      {mediaItems.length > 0 && (
        <div
          className="relative w-full overflow-hidden bg-slate-100 dark:bg-black select-none"
          onTouchStart={mediaItems.length > 1 ? handleTouchStart : undefined}
          onTouchEnd={mediaItems.length > 1 ? handleTouchEnd : undefined}
        >
          {mediaItems.length === 1 ? (
            // Single Item - Uncropped & Compactly Sized
            <div className="w-full flex items-center justify-center bg-slate-100 dark:bg-black min-h-[160px] max-h-[380px]">
              {mediaItems[0].type === "video" ? (
                <video
                  src={mediaItems[0].url}
                  poster={mediaItems.find(m => m.type === "image")?.url || bookmark.snapshot || undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
                />
              ) : (
                <a
                  href={sanitizeUrl(bookmark.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full"
                >
                  <InstagramImageItem
                    key={mediaItems[0].url}
                    url={mediaItems[0].url}
                    className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
                  />
                </a>
              )}
            </div>
          ) : (
            // Carousel Items - Swipeable Uncropped Slider
            <div className="relative w-full">
              {/* Slider Track */}
              <div
                className="flex w-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeMediaIdx * 100}%)` }}
              >
                {mediaItems.map((item, idx) => (
                  <div
                    key={`${item.url}-${idx}`}
                    className="w-full shrink-0 flex items-center justify-center bg-slate-100 dark:bg-black min-h-[160px] max-h-[380px]"
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
                      />
                    ) : (
                      <a
                        href={sanitizeUrl(bookmark.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full"
                      >
                        <InstagramImageItem
                          key={item.url}
                          url={item.url}
                          className="w-full h-auto max-h-[380px] object-contain mx-auto block bg-slate-100 dark:bg-black"
                        />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Counter Badge at Top Right (1/N) */}
              <div className="absolute top-2.5 right-2.5 z-20 bg-black/70 backdrop-blur-md text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none select-none tracking-wide">
                {activeMediaIdx + 1}/{mediaItems.length}
              </div>

              {/* Carousel Prev/Next Slide Buttons */}
              <CarouselNavButtons
                activeIndex={activeMediaIdx}
                total={mediaItems.length}
                onPrev={handlePrev}
                onNext={handleNext}
              />

              {/* Centered Pagination Dots at Bottom of Media */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-black/45 backdrop-blur-sm max-w-[85%] overflow-x-auto no-scrollbar">
                {mediaItems.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveMediaIdx(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-200 cursor-pointer ${
                      idx === activeMediaIdx
                        ? "w-1.5 h-1.5 bg-[#0095F6] scale-110"
                        : "w-1.5 h-1.5 bg-white/60 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Native Instagram Action Bar */}
      <div className="px-3.5 pt-2 flex items-center justify-between text-slate-900 dark:text-[#f5f5f5]">
        <div className="flex items-center gap-3">
          <div className="hover:opacity-60 transition-opacity cursor-pointer">
            <LikeIcon />
          </div>
          <div className="hover:opacity-60 transition-opacity cursor-pointer">
            <CommentIcon />
          </div>
          <div className="flex items-center gap-1 hover:opacity-60 transition-opacity cursor-pointer">
            <RepostIcon />
            {(metrics as any)?.reposts ? (
              <span className="text-[12.5px] font-semibold">
                {formatNumber((metrics as any).reposts)}
              </span>
            ) : null}
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
      {formatNumber(metrics?.likes) ? (
        <div className="px-3.5 pt-1.5 text-[13px] font-bold text-slate-900 dark:text-[#f5f5f5]">
          <span>{formatNumber(metrics?.likes)} likes</span>
        </div>
      ) : null}

      {/* Caption with Bold Inline Username */}
      <div className="px-3.5 pb-1 pt-0.5 flex-1">
        <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="block">
          <ExpandableText
            text={bookmark.description || bookmark.title}
            prefix={
              <span className="font-bold text-slate-900 dark:text-[#f5f5f5] inline-flex items-center gap-1 mr-1">
                <span>{author?.username || author?.name || "user"}</span>
                {author?.verified && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#0095F6] inline shrink-0">
                    <path d="M12.001 2.003L15.424 0l1.644 3.707 3.999.645-1.042 3.91 2.802 2.951-2.072 3.498 1.488 3.774-3.774 1.488-2.071 3.498-3.91-1.042-.646 3.998-3.707-1.644-2.853 2.502-1.745-3.66L0 19.336l2.36-3.23-2.07-3.499L2.359 9.11l-2.07-3.5L3.09 3.539l3.91 1.042.645-3.999 3.707 1.644 2.65-2.223zm-1.892 13.064l6.195-6.195-1.414-1.414-4.78 4.78-2.122-2.121-1.414 1.414 3.535 3.536z" />
                  </svg>
                )}
              </span>
            }
            maxLength={140}
            className="text-[13px] leading-snug break-words text-slate-900 dark:text-[#f5f5f5]"
            buttonClassName="ml-1 text-slate-500 hover:text-slate-900 dark:text-[#a8a8a8] dark:hover:text-white font-semibold"
          />
        </a>
      </div>

      {/* Post Date Timestamp */}
      {formatInstagramDate(cardData?.posted_at || bookmark.created_at) && (
        <div className="px-3.5 pb-2 pt-0.5 text-[10px] font-medium tracking-wide uppercase text-slate-400 dark:text-[#737373]">
          {formatInstagramDate(cardData?.posted_at || bookmark.created_at)}
        </div>
      )}
    </div>
  );
}
