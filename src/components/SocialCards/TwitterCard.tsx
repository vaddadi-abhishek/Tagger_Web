import React, { useState, useEffect, useMemo } from "react";
import type { Bookmark, XCardData, MediaItem } from "../../types/bookmark";
import { sanitizeUrl, formatNumber, formatDetailDate, parseCardData } from "../../lib/utils";
import { fetchUrlMetadata } from "../../services/api";
import { ExpandableText } from "./ExpandableText";
import { SafeImage } from "./SafeImage";
import { SafeVideo } from "./SafeVideo";
import {
  ReplyIcon,
  RepostIcon,
  LikeHeartIcon,
  BookmarkIcon,
  ShareIcon,
  VerifiedBadge,
  XBrandLogo,
} from "./SocialCardIcons";
import { CardActionMenu } from "./CardActionMenu";

function isTwitterProfileUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (!/(?:^|\.)(?:twitter|x)\.com$/i.test(parsed.hostname)) return false;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return false;
    const first = parts[0].toLowerCase();
    const systemSlugs = new Set([
      "home", "explore", "notifications", "messages", "search", "settings",
      "i", "hashtag", "login", "signup", "compose", "tos", "privacy",
      "rules", "help", "intent", "share", "account"
    ]);
    if (systemSlugs.has(first)) return false;
    if (parts.length === 1) return true;
    if (parts.length === 2 && ["header_photo", "photo", "about", "following", "followers", "verified_followers"].includes(parts[1].toLowerCase())) {
      return true;
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
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString();
  }
  return null;
}

function renderBioWithLinks(bioText: string) {
  const tokenRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g;
  const parts = bioText.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^https?:\/\//i.test(part) || /^www\./i.test(part) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(part)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      const display = part.replace(/^https?:\/\//i, "").replace(/\/$/, "");
      return (
        <a
          key={idx}
          href={sanitizeUrl(href)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1d9bf0] hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {display}
        </a>
      );
    }
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      return (
        <a
          key={idx}
          href={`https://x.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1d9bf0] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    if (part.startsWith("#")) {
      const tag = part.slice(1);
      return (
        <a
          key={idx}
          href={`https://x.com/hashtag/${tag}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1d9bf0] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

interface TwitterCardProps {
  bookmark: Bookmark;
  isMenuOpen?: boolean;
  onToggleMenu?: (id: string, e: React.MouseEvent) => void;
  onCloseMenu?: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
}

export const TwitterCard = React.memo(function TwitterCard(props: TwitterCardProps) {
  const {
    bookmark,
    isMenuOpen,
    onToggleMenu,
    onCloseMenu,
    onRequestDelete,
    onViewAiContext,
    onGenerateAiContext,
    isGeneratingAi,
  } = props;

  const cardData = useMemo(() => parseCardData<XCardData>(bookmark.card_data), [bookmark.card_data]);

  const author = cardData?.author;
  const metrics = cardData?.metrics;
  const postedAt = cardData?.posted_at || bookmark.created_at;

  const isProfile = useMemo(() => {
    if (cardData?.is_profile) return true;
    return (
      isTwitterProfileUrl(bookmark.url) ||
      isTwitterProfileUrl((bookmark as any).canonical_url)
    );
  }, [cardData?.is_profile, bookmark.url, (bookmark as any).canonical_url]);

  const [profileData, setProfileData] = useState<XCardData | null>(null);

  useEffect(() => {
    if (isProfile && (!cardData?.banner_url || !cardData?.metrics?.followers)) {
      let isMounted = true;
      fetchUrlMetadata(bookmark.url, true)
        .then((res) => {
          if (isMounted && res.card_data) {
            setProfileData(res.card_data as XCardData);
          }
        })
        .catch(() => { });
      return () => {
        isMounted = false;
      };
    }
  }, [isProfile, bookmark.url, cardData?.banner_url, cardData?.metrics?.followers]);

  // Extract playable video URL
  const videoUrl = useMemo((): string | null => {
    const rawMedia = cardData?.media as Array<MediaItem | string> | undefined;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          if (m.includes(".mp4") || m.includes("video.twimg.com") || m.includes("/vid/")) {
            return m;
          }
        } else if (typeof m === "object") {
          if ((m.type === "video" || m.type === "gif") && m.url) return m.url;
          if (m.url && (m.url.includes(".mp4") || m.url.includes("video.twimg.com") || m.url.includes("/vid/"))) {
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
      if (!trimmed) return;
      if (trimmed.includes(".mp4") || trimmed.includes("video.twimg.com") || trimmed.includes("/vid/")) {
        return;
      }
      if (!list.includes(trimmed)) {
        list.push(trimmed);
      }
    };

    const rawMedia = cardData?.media;
    if (Array.isArray(rawMedia)) {
      for (const m of rawMedia) {
        if (!m) continue;
        if (typeof m === "string") {
          addUrl(m);
        } else if (typeof m === "object") {
          if (m.type !== "video" && m.type !== "gif") {
            addUrl(m.url);
          }
        }
      }
    }

    return list;
  }, [cardData?.media]);

  const hasMedia = Boolean(videoUrl || postImages.length > 0);
  const handleText = author?.handle ? (author.handle.startsWith("@") ? author.handle : `@${author.handle}`) : "";

  const renderImageGrid = () => {
    if (postImages.length === 0) return null;

    if (postImages.length === 1) {
      return (
        <div className="px-3.5 mt-2">
          <a
            href={sanitizeUrl(bookmark.url)}
            target="_blank"
            rel="noreferrer"
            className="block w-full overflow-hidden rounded-xl border border-slate-200 dark:border-[#2f3336] bg-slate-100 dark:bg-black"
          >
            <SafeImage
              url={postImages[0]}
              alt="X post media"
              className="w-full h-auto max-h-[360px] object-contain mx-auto block bg-slate-100 dark:bg-black"
            />
          </a>
        </div>
      );
    }

    if (postImages.length === 2) {
      return (
        <div className="px-3.5 mt-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-44 sm:h-52 bg-slate-200 dark:bg-[#2f3336]">
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
            </a>
          </div>
        </div>
      );
    }

    if (postImages.length === 3) {
      return (
        <div className="px-3.5 mt-2">
          <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-48 sm:h-56 bg-slate-200 dark:bg-[#2f3336]">
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="row-span-2 col-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[0]} className="w-full h-full object-cover" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[1]} className="w-full h-full object-cover" />
            </a>
            <a href={sanitizeUrl(bookmark.url)} target="_blank" rel="noreferrer" className="col-span-1 row-span-1 relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block">
              <SafeImage url={postImages[2]} className="w-full h-full object-cover" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3.5 mt-2">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f3336] h-48 sm:h-56 bg-slate-200 dark:bg-[#2f3336]">
          {postImages.slice(0, 4).map((imgUrl, idx) => (
            <a
              key={idx}
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-zinc-900 block"
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
      </div>
    );
  };

  if (isProfile) {
    const bannerUrl = profileData?.banner_url || cardData?.banner_url || null;
    const avatarUrl = profileData?.author?.avatar_url || author?.avatar_url || null;
    const name = profileData?.author?.name || author?.name || bookmark.title?.split(" (")[0]?.split(" on X")[0] || "User";
    const rawHandle = profileData?.author?.handle || author?.handle;
    const handle = rawHandle ? (rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`) : "";
    const verified = Boolean(profileData?.author?.verified ?? author?.verified);
    const displayBio = profileData?.bio || cardData?.bio || (bookmark.description && !bookmark.description.includes("on X") ? bookmark.description : null);
    const joinedDate = profileData?.joined_date || cardData?.joined_date || null;
    const following = formatProfileCount(profileData?.metrics?.following ?? metrics?.following);
    const followers = formatProfileCount(profileData?.metrics?.followers ?? metrics?.followers);
    const profileUrl = sanitizeUrl(bookmark.url);

    return (
      <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#e7e9ea] font-sans rounded-2xl border border-slate-200/80 dark:border-[#2f3336] overflow-hidden shadow-sm">
        {/* 1. Header Banner with 3:1 ratio and floating controls */}
        <div className="relative w-full aspect-[3/1] max-h-36 sm:max-h-40 bg-slate-200 dark:bg-[#16181c] overflow-hidden">
          {bannerUrl ? (
            <SafeImage
              url={bannerUrl}
              alt={`${name}'s header banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-700 via-slate-800 to-zinc-900 dark:from-[#15181c] dark:to-[#22272c]" />
          )}

          {/* Floating translucent action menu button */}
          <div className="absolute top-2.5 right-3 z-10 pointer-events-auto">
            <CardActionMenu
              bookmark={bookmark}
              isOpen={Boolean(isMenuOpen)}
              onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
              onClose={onCloseMenu || (() => { })}
              onViewAiContext={onViewAiContext}
              onGenerateAiContext={onGenerateAiContext}
              isGeneratingAi={isGeneratingAi}
              onRequestDelete={onRequestDelete}
              theme="twitter"
              icon="horizontal"
              buttonClassName="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-sm cursor-pointer outline-none"
            />
          </div>
        </div>

        {/* 2. Avatar & Action Buttons Row (Overlapping the banner) */}
        <div className="px-3.5 sm:px-4 -mt-10 sm:-mt-11 flex items-end justify-between relative z-10">
          {/* Overlapping circular avatar */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="relative block rounded-full ring-4 ring-white dark:ring-black bg-white dark:bg-black overflow-hidden shadow-md shrink-0 w-20 h-20 sm:w-22 sm:h-22"
          >
            {avatarUrl ? (
              <SafeImage
                url={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-300 dark:bg-[#202327] flex items-center justify-center text-slate-500 font-bold text-xl">
                {name?.[0]?.toUpperCase() || "X"}
              </div>
            )}
          </a>

          {/* Action buttons on the right matching screenshot */}
          <div className="flex items-center gap-2 mb-1">
            {/* Profile Checkmark / Following status button */}
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full border border-slate-300 dark:border-[#536471] bg-white/50 dark:bg-black/50 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-800 dark:text-[#eff3f4] transition-colors cursor-pointer"
              title="Following"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M14 6c0 2.21-1.791 4-4 4S6 8.21 6 6s1.791-4 4-4 4 1.79 4 4zm-4 5c-2.352 0-4.373.85-5.863 2.44-1.477 1.58-2.366 3.8-2.632 6.46l-.11 1.1h17.21l-.11-1.1c-.266-2.66-1.155-4.88-2.632-6.46C14.373 11.85 12.352 11 10 11zm12.223-5.89l-2.969 4.46L17.3 8.1l-1.2 1.6 3.646 2.73 4.141-6.21-1.664-1.11z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 3. Name, Badges & Handle Row */}
        <div className="px-3.5 sm:px-4 mt-2 flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="font-extrabold text-[18px] sm:text-[19px] text-slate-900 dark:text-[#e7e9ea] leading-tight hover:underline truncate"
            >
              {name}
            </a>
            {verified && <VerifiedBadge />}
            {/* Small 𝕏 affiliation badge */}
            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[#16181c] border border-white/20 text-[10px] text-white font-mono leading-none select-none">
              𝕏
            </span>
          </div>
          <span className="text-[13.5px] text-slate-500 dark:text-[#71767b] leading-tight mt-0.5">
            {handle}
          </span>
        </div>

        {/* 4. Bio with Links (rendered only if bio is non-empty) */}
        {displayBio ? (
          <div className="px-3.5 sm:px-4 mt-2 text-[13.5px] text-slate-800 dark:text-[#e7e9ea] leading-normal break-words">
            {renderBioWithLinks(displayBio)}
          </div>
        ) : null}

        {/* 5. Joined Date with calendar icon and chevron */}
        {joinedDate ? (
          <div className="px-3.5 sm:px-4 mt-2 flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-[#71767b]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
              <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z" />
            </svg>
            <span>{joinedDate}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current opacity-70 shrink-0">
              <path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z" />
            </svg>
          </div>
        ) : null}

        {/* 6. Following & Followers stats */}
        <div className="px-3.5 sm:px-4 mt-2.5 pb-3 flex items-center gap-4 text-[13.5px]">
          {following ? (
            <a
              href={`${profileUrl}/following`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea]">
                {following}
              </span>
              <span className="text-slate-500 dark:text-[#71767b]">Following</span>
            </a>
          ) : null}

          {followers ? (
            <a
              href={`${profileUrl}/verified_followers`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea]">
                {followers}
              </span>
              <span className="text-slate-500 dark:text-[#71767b]">Followers</span>
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black text-slate-900 dark:text-[#e7e9ea] font-sans pb-2 rounded-2xl border border-slate-200/80 dark:border-[#2f3336] overflow-hidden shadow-sm">
      {/* Header Stacked */}
      <div className="px-3.5 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          {author?.avatar_url ? (
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-[#16181c]">
              <SafeImage
                url={author.avatar_url}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#16181c] shrink-0" />
          )}
          <div className="flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 dark:text-[#e7e9ea] text-[13.5px] truncate">
                {author?.name || "X User"}
              </span>
              {author?.verified && <VerifiedBadge />}
            </div>
            <span className="text-slate-500 dark:text-[#71767b] text-[12.5px] leading-tight truncate">
              {handleText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 dark:text-[#71767b] shrink-0">
          <div className="p-1 transition-colors">
            <XBrandLogo />
          </div>
          <CardActionMenu
            bookmark={bookmark}
            isOpen={Boolean(isMenuOpen)}
            onToggle={(e) => onToggleMenu?.(bookmark.id, e)}
            onClose={onCloseMenu || (() => { })}
            onViewAiContext={onViewAiContext}
            onGenerateAiContext={onGenerateAiContext}
            isGeneratingAi={isGeneratingAi}
            onRequestDelete={onRequestDelete}
            theme="twitter"
            icon="vertical"
            buttonClassName="p-1 rounded-lg hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer text-slate-500 dark:text-[#71767b] outline-none"
          />
        </div>
      </div>

      {/* Article Header Badge if X Article */}
      {bookmark.is_article && (
        <div className="px-3.5 pt-2">
          <a
            href={`/my/app/${bookmark.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>Article · {cardData?.reading_time_minutes ? `${cardData.reading_time_minutes} min read` : 'Reader Mode'}</span>
          </a>
          {bookmark.title && !bookmark.title.endsWith(' on X') && (
            <a
              href={`/my/app/${bookmark.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-bold text-[15px] sm:text-[16px] mt-1.5 text-slate-900 dark:text-white leading-snug hover:underline"
            >
              {bookmark.title}
            </a>
          )}
        </div>
      )}

      {/* Tweet Body */}
      <div className="px-3.5 mt-2">
        <a
          href={sanitizeUrl(bookmark.url)}
          target="_blank"
          rel="noreferrer"
          className="block text-slate-900 dark:text-[#e7e9ea]"
        >
          <ExpandableText
            text={bookmark.description || bookmark.title}
            className={`${hasMedia ? "text-[13.5px]" : "text-[15px]"} leading-normal`}
          />
        </a>
      </div>

      {/* Media: Playable Video or Multi-Image Grid */}
      {hasMedia &&
        (videoUrl && !videoError ? (
          <div className="px-3.5 mt-2">
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-[#2f3336]">
              <SafeVideo
                key={videoUrl}
                src={videoUrl}
                poster={cardData?.video_thumbnail || postImages[0]}
                controls
                playsInline
                className="w-full max-h-[360px] object-contain bg-slate-100 dark:bg-black mx-auto block"
                onError={() => setVideoError(true)}
              />
            </div>
          </div>
        ) : videoUrl && videoError ? (
          <div className="px-3.5 mt-2">
            <div className="w-full rounded-xl p-4 bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-[12px] text-slate-300">Video playback unavailable in direct preview</p>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setVideoError(false)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  Retry
                </button>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-2.5 py-1 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium transition cursor-pointer"
                >
                  Open Video ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          renderImageGrid()
        ))}

      {/* Date & Views Row */}
      {Boolean(formatDetailDate(postedAt) || (metrics?.views && metrics.views > 0)) ? (
        <div className="px-3.5 mt-2.5">
          <div className="flex flex-wrap items-center gap-1 text-[12px] text-slate-500 dark:text-[#71767b]">
            {formatDetailDate(postedAt) && <span>{formatDetailDate(postedAt)}</span>}
            {metrics?.views && metrics.views > 0 ? (
              <>
                {formatDetailDate(postedAt) && <span>·</span>}
                <span className="font-bold text-slate-900 dark:text-[#e7e9ea] ml-0.5">
                  {formatNumber(metrics.views)}
                </span>
                <span>Views</span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <hr className="border-slate-200 dark:border-[#2f3336] mx-3.5 mt-2" />

      {/* Action Row */}
      <div className="px-3.5 py-2 flex justify-between items-center text-slate-500 dark:text-[#71767b]">
        <div className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-1.5">
            <ReplyIcon />
          </div>
          {formatNumber(metrics?.replies) ? <span>{formatNumber(metrics?.replies)}</span> : null}
        </div>
        <div className="flex items-center gap-1 hover:text-[#00ba7c] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#00ba7c]/10 transition-colors -ml-1.5">
            <RepostIcon />
          </div>
          {formatNumber(metrics?.reposts) ? <span>{formatNumber(metrics?.reposts)}</span> : null}
        </div>
        <div className="flex items-center gap-1 hover:text-[#f91880] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#f91880]/10 transition-colors -ml-1.5">
            <LikeHeartIcon />
          </div>
          {formatNumber(metrics?.likes) ? <span>{formatNumber(metrics?.likes)}</span> : null}
        </div>
        <div className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer group/action text-[12px]">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors -ml-1.5">
            <BookmarkIcon />
          </div>
          {formatNumber(metrics?.bookmarks) ? <span>{formatNumber(metrics?.bookmarks)}</span> : null}
        </div>
        <div className="flex items-center hover:text-[#1d9bf0] transition-colors cursor-pointer group/action">
          <div className="p-1.5 rounded-full group-hover/action:bg-[#1d9bf0]/10 transition-colors">
            <ShareIcon />
          </div>
        </div>
      </div>
    </div>
  );
});
