import React, { useState, useMemo } from "react";
import type { Bookmark, FacebookCardData, MediaItem } from "../../types/bookmark";
import { sanitizeUrl, formatNumber, formatRelativeDate, parseCardData } from "../../lib/utils";
import { ExpandableText } from "./ExpandableText";
import { SafeImage } from "./SafeImage";
import { SafeVideo } from "./SafeVideo";
import {
  FacebookBrandLogo,
  FacebookLikeBadge,
  FacebookShareIcon,
  FacebookVerifiedBadge,
  CommentIcon,
} from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

function isFacebookProfileUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("facebook.com")) return false;

    if (parsed.pathname === "/profile.php" && parsed.searchParams.has("id")) {
      return true;
    }

    if (parsed.pathname.startsWith("/people/")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && !["posts", "videos", "photos", "reels"].includes(parts[parts.length - 1])) {
        return true;
      }
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return false;

    const systemPaths = new Set([
      "watch", "reel", "reels", "stories", "story.php", "photo", "photo.php",
      "photos", "video", "videos", "share", "permalink.php", "groups", "events",
      "gaming", "marketplace", "login", "login.php", "help", "settings",
      "policies", "recover", "checkpoint", "hashtag", "search", "dialog", "plugins"
    ]);

    const firstSegment = segments[0].toLowerCase();
    if (systemPaths.has(firstSegment)) return false;

    if (segments.length === 1) return true;

    if (segments.length === 2) {
      const profileSubpages = new Set(["about", "followers", "following", "photos", "reels", "videos", "community"]);
      return profileSubpages.has(segments[1].toLowerCase());
    }

    return false;
  } catch {
    return false;
  }
}

function formatProfileCount(val: unknown): string | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") {
    if (val >= 1_000_000) {
      const m = val / 1_000_000;
      return `${Math.floor(m)}M`;
    }
    if (val >= 1_000) {
      const k = val / 1_000;
      return `${Math.floor(k)}K`;
    }
    return val.toLocaleString();
  }
  return null;
}

interface FacebookCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

export const FacebookCard = React.memo(function FacebookCard(props: FacebookCardProps) {
  const {
    bookmark,
    onToggleMenu,
    isMenuOpen,
    onViewAiContext,
    onGenerateAiContext,
    isGeneratingAi,
    onRequestDelete,
    onCloseMenu,
  } = props;

  const cardData = useMemo(
    () => parseCardData<FacebookCardData>(bookmark.card_data),
    [bookmark.card_data]
  );

  const author = cardData?.author;
  const metrics = cardData?.metrics;
  const postedAt = cardData?.posted_at || bookmark.created_at;

  const isProfile = useMemo(() => {
    if (cardData?.is_profile) return true;
    return isFacebookProfileUrl(bookmark.url) || isFacebookProfileUrl(bookmark.canonical_url);
  }, [cardData?.is_profile, bookmark.url, bookmark.canonical_url]);

  // Extract playable video URL
  const videoUrl = useMemo((): string | null => {
    const rawMedia = cardData?.media as Array<MediaItem | string> | undefined;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          if (m.includes(".mp4") || m.includes("fbcdn.net") || m.includes("video")) {
            return m;
          }
        } else if (typeof m === "object") {
          if (m.type === "video" && m.url) return m.url;
          if (m.url && (m.url.includes(".mp4") || m.url.includes("video"))) {
            return m.url;
          }
        }
      }
    }
    return null;
  }, [cardData?.media]);

  const [videoError, setVideoError] = useState(false);

  // Extract all valid image URLs
  const postImages: string[] = useMemo(() => {
    const list: string[] = [];
    const addUrl = (u: unknown) => {
      if (!u || typeof u !== "string") return;
      const trimmed = u.trim();
      if (!trimmed || trimmed.includes(".mp4")) return;
      if (!list.includes(trimmed)) {
        list.push(trimmed);
      }
    };

    const rawMedia = cardData?.media as Array<MediaItem | string> | undefined;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          addUrl(m);
        } else if (typeof m === "object") {
          if (m.type !== "video") {
            addUrl(m.url);
          }
        }
      }
    }

    return list;
  }, [cardData?.media]);

  const hasMedia = Boolean(videoUrl || postImages.length > 0);

  if (isProfile) {
    const bannerUrl =
      cardData?.banner_url ||
      (cardData?.media?.[0]
        ? typeof cardData.media[0] === "string"
          ? cardData.media[0]
          : cardData.media[0].url
        : null);
    const avatarUrl = author?.avatar_url || null;
    const name = author?.name || bookmark.title || "Facebook User";
    const verified = Boolean(author?.verified);
    const followers = formatProfileCount(cardData?.followers);
    const following = formatProfileCount(cardData?.following);
    const category = cardData?.category || null;
    const profileUrl = sanitizeUrl(bookmark.url);
    const displayBio = bookmark.description || "";

    const isMediaCategory =
      Boolean(category && /cinema|movie|film|video|tv|entertainment|music/i.test(category));

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#1c1e21] text-slate-900 dark:text-[#e4e6eb] font-sans rounded-2xl border border-slate-200/80 dark:border-[#3a3b3c] overflow-hidden shadow-sm">
        {/* 1. Cover Banner with floating menu and Facebook logo */}
        <div className="relative w-full aspect-[2.6/1] max-h-40 sm:max-h-48 bg-slate-200 dark:bg-[#18191a] overflow-hidden">
          {bannerUrl ? (
            <SafeImage
              url={bannerUrl}
              alt={`${name}'s cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-700 via-slate-800 to-zinc-900 dark:from-[#18191a] dark:to-[#242526]" />
          )}

          {/* Left top: Facebook brand logo */}
          <div className="absolute top-2.5 left-3 z-10 pointer-events-auto">
            <div className="p-1 rounded-full bg-black/40 backdrop-blur-md">
              <FacebookBrandLogo className="w-5 h-5" />
            </div>
          </div>

          {/* Right top: Card Action Menu */}
          <div className="absolute top-2.5 right-3 z-10 pointer-events-auto">
            <CardActionMenu
              bookmark={bookmark}
              isOpen={Boolean(isMenuOpen)}
              onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
              onClose={onCloseMenu || (() => {})}
              onViewAiContext={onViewAiContext}
              onGenerateAiContext={onGenerateAiContext}
              isGeneratingAi={isGeneratingAi}
              onRequestDelete={onRequestDelete}
              theme="facebook"
              icon="horizontal"
              buttonClassName="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-sm cursor-pointer outline-none"
            />
          </div>
        </div>

        {/* 2. Overlapping Circular Avatar in Center */}
        <div className="flex flex-col items-center -mt-12 sm:-mt-14 relative z-10 px-4">
          <div className="relative">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="relative block rounded-full ring-4 ring-white dark:ring-[#1c1e21] bg-white dark:bg-[#242526] overflow-hidden shadow-md shrink-0 w-24 h-24 sm:w-28 sm:h-28"
            >
              {avatarUrl ? (
                <SafeImage
                  url={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-[#3a3b3c] flex items-center justify-center text-slate-600 dark:text-[#e4e6eb] font-bold text-2xl">
                  {name[0]?.toUpperCase() || "F"}
                </div>
              )}
            </a>
            {/* Active status indicator green dot on bottom-right of avatar circle */}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1c1e21]"
              title="Active Status"
            />
          </div>

          {/* 3. Centered Name & Verified Badge */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[19px] sm:text-[21px] text-slate-900 dark:text-white leading-tight hover:underline text-center"
            >
              {name}
            </a>
            {verified && <FacebookVerifiedBadge className="w-5 h-5" />}
          </div>

          {/* 4. Followers & Following Row */}
          {(followers || following) && (
            <div className="text-[13px] sm:text-[13.5px] text-slate-500 dark:text-[#b0b3b8] mt-0.5 text-center font-normal">
              {followers && <span>{followers} followers</span>}
              {followers && following && <span className="mx-1.5">•</span>}
              {following && <span>{following} following</span>}
            </div>
          )}

          {/* 5. Bio / Description */}
          {displayBio ? (
            <div className="mt-3 text-[13.5px] text-slate-800 dark:text-[#e4e6eb] text-center leading-relaxed max-w-md mx-auto">
              <ExpandableText text={displayBio} className="text-[13.5px] leading-relaxed" />
            </div>
          ) : null}

          {/* 7. Category / Highlighted Details */}
          {category && (
            <div className="mt-2.5 mb-2 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-500 dark:text-[#b0b3b8]">
              {isMediaCategory ? (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4h16V6H4v2zm0 2v8h16v-8H4z" />
                </svg>
              ) : /game|gaming/i.test(category) ? (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 shrink-0">
                  <path d="M7 7h.01M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
                </svg>
              )}
              <span>{category}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    if (postImages.length === 1) {
      return (
        <div className="w-full overflow-hidden border-y border-slate-200 dark:border-[#3a3b3c]/50 bg-slate-100 dark:bg-black">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <SafeImage
              url={postImages[0]}
              alt="Facebook media"
              className="w-full h-auto max-h-[360px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        </div>
      );
    }

    if (postImages.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5 border-y border-slate-200 dark:border-[#3a3b3c]/50 h-44 sm:h-52 bg-slate-200 dark:bg-[#3a3b3c]">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#18191a] block"
          >
            <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
          </a>
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#18191a] block"
          >
            <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
          </a>
        </div>
      );
    }

    if (postImages.length === 3) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5 border-y border-slate-200 dark:border-[#3a3b3c]/50 h-48 sm:h-56 bg-slate-200 dark:bg-[#3a3b3c]">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="row-span-2 col-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#18191a] block"
          >
            <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
          </a>
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#18191a] block"
          >
            <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
          </a>
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#18191a] block"
          >
            <SafeImage url={postImages[2]} className="w-full h-full object-cover" />
          </a>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 border-y border-slate-200 dark:border-[#3a3b3c]/50 h-48 sm:h-56 bg-slate-200 dark:bg-[#3a3b3c]">
        {postImages.slice(0, 4).map((imgUrl, idx) => (
          <a
            key={idx}
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#18191a] block"
          >
            <SafeImage url={imgUrl} className="w-full h-full object-cover" />
            {idx === 3 && postImages.length > 4 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                +{postImages.length - 3}
              </div>
            )}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#242526] text-slate-900 dark:text-[#e4e6eb] font-sans rounded-2xl border border-slate-200/80 dark:border-[#3a3b3c] overflow-hidden pb-2 shadow-sm">
      {/* 1. Facebook Header: Avatar, Name, Date & FB Logo */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-[#3a3b3c]">
              <SafeImage
                url={author.avatar_url}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#3a3b3c] flex items-center justify-center font-bold text-slate-600 dark:text-[#e4e6eb] text-sm shrink-0">
              {author?.name ? author.name[0].toUpperCase() : "F"}
            </div>
          )}

          <div className="flex flex-col justify-center overflow-hidden leading-tight">
            <span className="font-semibold text-slate-900 dark:text-[#e4e6eb] text-[13.5px] truncate hover:underline cursor-pointer">
              {author?.name || "Facebook User"}
            </span>
            <div className="flex items-center gap-1 text-[11.5px] text-slate-500 dark:text-[#b0b3b8]">
              {formatRelativeDate(postedAt) && <span>{formatRelativeDate(postedAt)}</span>}
              <span>•</span>
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zm-.5-10.25a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-.22.53l-2 2a.75.75 0 0 1-1.06-1.06l1.78-1.78v-3.19z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <div className="p-0.5 shrink-0">
            <FacebookBrandLogo />
          </div>
          <CardActionMenu
            bookmark={bookmark}
            isOpen={Boolean(isMenuOpen)}
            onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
            onClose={onCloseMenu || (() => {})}
            onViewAiContext={onViewAiContext}
            onGenerateAiContext={onGenerateAiContext}
            isGeneratingAi={isGeneratingAi}
            onRequestDelete={onRequestDelete}
            theme="facebook"
            icon="vertical"
            buttonClassName="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer text-slate-500 dark:text-[#b0b3b8] outline-none"
          />
        </div>
      </div>

      {/* 2. Post Body Text */}
      <div className="px-3.5 mb-2">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="block text-slate-900 dark:text-[#e4e6eb]"
        >
          <ExpandableText
            text={bookmark.description || bookmark.title}
            className="text-[13.5px] leading-normal"
          />
        </a>
      </div>

      {/* 3. Media: Video or Multi-Image */}
      {hasMedia &&
        (videoUrl && !videoError ? (
          <div className="w-full border-y border-slate-200 dark:border-[#3a3b3c]/50 bg-slate-100 dark:bg-black">
            <SafeVideo
              key={videoUrl}
              src={videoUrl}
              poster={cardData?.video_thumbnail || postImages[0]}
              controls
              playsInline
              className="w-full max-h-[380px] object-contain bg-slate-100 dark:bg-black mx-auto block"
              onError={() => setVideoError(true)}
            />
          </div>
        ) : videoUrl && videoError ? (
          <div className="p-4 mx-3.5 my-1 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-[12px] text-slate-300">Direct Facebook video playback unavailable</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1 rounded-full bg-[#1877F2] text-white font-medium hover:bg-[#166fe5] transition"
            >
              Watch on Facebook ↗
            </a>
          </div>
        ) : (
          renderImageGrid()
        ))}

      {/* 4. Reactions & Comments Metrics Bar */}
      <div className="px-3.5 py-2 flex items-center justify-between text-slate-500 dark:text-[#b0b3b8] mt-auto border-t border-slate-100 dark:border-[#2f3336]/40">
        <div className="flex items-center gap-1.5 hover:text-[#1877F2] transition-colors cursor-pointer text-[12px]">
          <FacebookLikeBadge />
          {formatNumber(metrics?.likes) ? (
            <span className="font-normal text-slate-700 dark:text-[#e4e6eb] text-[12px]">
              {formatNumber(metrics?.likes)}
            </span>
          ) : (
            <span>Like</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[12px]">
          {metrics?.comments ? (
            <div className="flex items-center gap-1 hover:underline cursor-pointer">
              <span>{formatNumber(metrics.comments)}</span>
              <span>comments</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              <CommentIcon className="w-3.5 h-3.5" />
              <span>Comment</span>
            </div>
          )}

          {metrics?.shares ? (
            <div className="flex items-center gap-1 hover:underline cursor-pointer">
              <span>{formatNumber(metrics.shares)}</span>
              <span>shares</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              <FacebookShareIcon />
              <span>Share</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
