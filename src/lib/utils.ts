import type { Bookmark } from "../types/bookmark";

/**
 * Merges conditional CSS classes cleanly into a single string.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sanitizes URLs to prevent XSS through dangerous protocols (javascript, vbscript, data, file)
 * and strips non-printable control characters.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return "#";
  const clean = Array.from(url)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .trim();

  if (!clean) return "#";

  const lower = clean.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  if (!/^https?:\/\//i.test(clean)) {
    return `https://${clean}`;
  }

  return clean;
}

/**
 * Formats large engagement numbers into standard compact strings (e.g. 1.2K, 3.4M).
 */
export function formatNumber(num?: number): string | null {
  if (num === undefined || num === null || num <= 0) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Formats ISO date strings into relative time ("5m", "3h", "2d") or short date.
 */
export function formatRelativeDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return null;

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Formats a date into full detailed timestamp (e.g. "3:45 PM · Jan 12, 2026").
 */
export function formatDetailDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${timeStr} · ${dateStr}`;
}

/**
 * Safely parses card_data whether it arrives as an object or serialized JSON string.
 */
export function parseCardData<T>(rawCardData: unknown): T | null {
  if (!rawCardData) return null;
  if (typeof rawCardData === "string") {
    try {
      return JSON.parse(rawCardData) as T;
    } catch {
      return null;
    }
  }
  return rawCardData as T;
}

/**
 * Single source of truth to resolve platform type for any bookmark.
 */
export function resolveCardType(bookmark: Bookmark): string {
  const rawType = (bookmark.type || "").toLowerCase().trim();
  if (rawType === "x" || rawType === "twitter") return "x";
  if (rawType === "reddit") return "reddit";
  if (rawType === "instagram") return "instagram";
  if (rawType === "linkedin") return "linkedin";
  if (rawType === "youtube") return "youtube";
  if (rawType === "facebook") return "facebook";
  if (rawType === "pinterest") return "pinterest";

  const url = (bookmark.url || "").toLowerCase();
  const site = (bookmark.site_name || "").toLowerCase();

  if (url.includes("twitter.com") || url.includes("x.com") || site.includes("twitter")) return "x";
  if (url.includes("reddit.com") || site.includes("reddit")) return "reddit";
  if (url.includes("instagram.com") || site.includes("instagram")) return "instagram";
  if (url.includes("pinterest.com") || url.includes("pin.it") || site.includes("pinterest")) return "pinterest";
  if (url.includes("linkedin.com") || site.includes("linkedin")) return "linkedin";
  if (url.includes("youtube.com") || url.includes("youtu.be") || site.includes("youtube")) return "youtube";
  if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com") || site.includes("facebook")) return "facebook";

  return "generic";
}

/**
 * Checks if a bookmark matches a given platform filter tab.
 */
export function matchesPlatform(bookmark: Bookmark, platform: string): boolean {
  if (!platform || platform === "all") return true;
  return resolveCardType(bookmark) === platform;
}

/**
 * Resolves a high-resolution favicon URL via Google S2 favicon service.
 */
export function getFaviconUrl(url?: string): string {
  if (!url) return "";
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "";
  }
}

/**
 * Platform tabs definition for dashboard filters.
 */
export const PLATFORM_TABS = [
  { id: "all", label: "All" },
  { id: "x", label: "Twitter / X" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "pinterest", label: "Pinterest" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "reddit", label: "Reddit" },
] as const;

// Tracking, analytics, and social share tracking parameters to strip
const TRACKING_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_name",
  "stkn", // Instagram share token
  "igsh", // Instagram share hash
  "igshid", // Instagram share id
  "fbclid", // Facebook click id
  "gclid", // Google click id
  "gbraid", // Google app tracking
  "wbraid",
  "msclkid", // Microsoft click id
  "yclid", // Yandex click id
  "mc_cid", // Mailchimp campaign id
  "mc_eid", // Mailchimp email id
  "ref", // Generic referrer
  "ref_src", // Twitter ref source
  "ref_url", // Twitter ref url
  "s", // Twitter share parameter (e.g. ?s=20)
  "si", // YouTube share identifier
  "feature", // YouTube feature parameter
  "pp", // YouTube playlist param
  "mibextid", // Facebook mobile tracking
  "share_id", // Reddit share ID
  "rdt_cid", // Reddit tracking
  "_ga", // Google Analytics
  "_gl",
  "_hsenc", // HubSpot
  "_hsmi",
]);

/**
 * Pre-cleans raw user input: strips platform labels (e.g. 'x: ', 'insta: '),
 * removes markdown brackets, and isolates the URL candidate.
 */
function cleanRawUrlInput(rawInput: string): string {
  if (!rawInput || typeof rawInput !== "string") return "";
  let str = rawInput.trim();

  // Strip markdown links like [title](https://...) or <https://...>
  str = str.replace(/^<([^>]+)>$/, "$1");
  const mdMatch = str.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) {
    str = mdMatch[1];
  }

  // Strip leading platform labels like "x: ", "insta: ", "instagram: ", etc.
  str = str.replace(
    /^(?:x|twitter|insta|instagram|facebook|fb|reddit|youtube|yt|github|web|link):\s*/i,
    ""
  );

  return str.trim();
}

/**
 * Canonicalizes a URL to a normalized, deterministic string.
 * Strips tracking parameters, trailing random content, normalizes aliases (e.g. /reels/ to /reel/),
 * and unifies hostnames so identical posts share the exact same key.
 */
export function canonicalizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";

  const preCleaned = cleanRawUrlInput(rawUrl);
  if (!preCleaned) return "";

  // 1. Twitter / X Canonicalization
  // Matches: x.com/user/status/123, twitter.com/user/status/123 with optional trailing text or paths
  const tweetMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?([a-zA-Z0-9_]+)\/status\/(\d+)/i
  );
  if (tweetMatch) {
    const handle = tweetMatch[1].toLowerCase();
    const statusId = tweetMatch[2];
    return `https://x.com/${handle}/status/${statusId}`;
  }

  // 2. Instagram Canonicalization
  // Matches: instagram.com/p/ID, instagram.com/reel/ID, instagram.com/reels/ID, instagram.com/tv/ID
  const igMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i
  );
  if (igMatch) {
    const shortcode = igMatch[1];
    return `https://www.instagram.com/reel/${shortcode}/`;
  }

  // 3. YouTube Canonicalization
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
  const ytMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    // Preserve timestamp 't' if present
    const tMatch = preCleaned.match(/[?&]t=([0-9a-zA-Z]+)/i);
    return tMatch
      ? `https://www.youtube.com/watch?v=${videoId}&t=${tMatch[1]}`
      : `https://www.youtube.com/watch?v=${videoId}`;
  }

  // 4. Reddit Canonicalization
  // 4a. Check for Comment URL first (so /comment/ID is not lost)
  const redditCommentMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/([^/\s]+)\/comments\/([a-zA-Z0-9]+)(?:\/[^/\s]+)?\/comment\/([a-zA-Z0-9]+)/i
  );
  if (redditCommentMatch) {
    const subreddit = redditCommentMatch[1].toLowerCase();
    const postId = redditCommentMatch[2];
    const commentId = redditCommentMatch[3];
    return `https://www.reddit.com/r/${subreddit}/comments/${postId}/comment/${commentId}/`;
  }

  // 4b. Check for Old-style Comment URL: /r/sub/comments/POST_ID/slug/COMMENT_ID/
  const oldCommentMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/([^/\s]+)\/comments\/([a-zA-Z0-9]+)\/[^/\s]+\/([a-zA-Z0-9]{6,})(?:\/|$|\?)/i
  );
  if (oldCommentMatch && !['comment', 'comments', 'live', 'photos', 'video'].includes(oldCommentMatch[3].toLowerCase())) {
    const subreddit = oldCommentMatch[1].toLowerCase();
    const postId = oldCommentMatch[2];
    const commentId = oldCommentMatch[3];
    return `https://www.reddit.com/r/${subreddit}/comments/${postId}/comment/${commentId}/`;
  }

  // 4c. Check for Standard Post URL
  const redditPostMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/([^/\s]+)\/comments\/([a-zA-Z0-9]+)/i
  );
  if (redditPostMatch) {
    const subreddit = redditPostMatch[1].toLowerCase();
    const postId = redditPostMatch[2];
    return `https://www.reddit.com/r/${subreddit}/comments/${postId}/`;
  }
  const redditShortMatch = preCleaned.match(/(?:https?:\/\/)?redd\.it\/([a-zA-Z0-9]+)/i);
  if (redditShortMatch) {
    return `https://redd.it/${redditShortMatch[1]}`;
  }

  // 5. Pinterest Canonicalization
  // Matches: pinterest.com/pin/ID, pin.it/ID
  const pinMatch = preCleaned.match(
    /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:pinterest\.[a-z.]+|pin\.it)\/pin\/(\d+)/i
  );
  if (pinMatch) {
    const pinId = pinMatch[1];
    return `https://www.pinterest.com/pin/${pinId}/`;
  }
  const pinShortMatch = preCleaned.match(/(?:https?:\/\/)?pin\.it\/([a-zA-Z0-9]+)/i);
  if (pinShortMatch) {
    return `https://pin.it/${pinShortMatch[1]}`;
  }

  // 6. General Web URLs
  let formatted = preCleaned;
  // If there are trailing spaces or words, isolate the URL part
  const spaceIdx = formatted.search(/\s/);
  if (spaceIdx > 0) {
    formatted = formatted.slice(0, spaceIdx);
  }

  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const urlObj = new URL(formatted);
    urlObj.protocol = "https:";

    if (urlObj.port === "443" || urlObj.port === "80") {
      urlObj.port = "";
    }

    urlObj.hash = "";

    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }
    urlObj.hostname = hostname;

    for (const param of Array.from(urlObj.searchParams.keys())) {
      if (TRACKING_QUERY_PARAMS.has(param.toLowerCase())) {
        urlObj.searchParams.delete(param);
      }
    }

    let pathname = urlObj.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;
    urlObj.searchParams.sort();

    return urlObj.toString();
  } catch {
    return preCleaned;
  }
}

/**
 * Checks if two URLs represent the exact same piece of content by comparing
 * their canonical strings as well as platform entity identifiers (e.g. Tweet status ID,
 * Instagram shortcode, YouTube video ID, Reddit post ID).
 */
export function isSameBookmarkUrl(urlA?: string | null, urlB?: string | null): boolean {
  if (!urlA || !urlB) return false;
  const trimmedA = urlA.trim();
  const trimmedB = urlB.trim();
  if (trimmedA === trimmedB) return true;

  const canonicalA = canonicalizeUrl(trimmedA);
  const canonicalB = canonicalizeUrl(trimmedB);
  if (canonicalA && canonicalB && canonicalA === canonicalB) return true;

  // Compare Twitter / X status IDs
  const tweetIdA = trimmedA.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?[a-zA-Z0-9_]+\/status\/(\d+)/i)?.[1];
  const tweetIdB = trimmedB.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?[a-zA-Z0-9_]+\/status\/(\d+)/i)?.[1];
  if (tweetIdA && tweetIdB && tweetIdA === tweetIdB) return true;

  // Compare Instagram shortcodes (e.g. Dc5xzmXT4r0)
  const igCodeA = trimmedA.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i)?.[1];
  const igCodeB = trimmedB.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i)?.[1];
  if (igCodeA && igCodeB && igCodeA === igCodeB) return true;

  // Compare YouTube video IDs
  const ytA = trimmedA.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i)?.[1];
  const ytB = trimmedB.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i)?.[1];
  if (ytA && ytB && ytA === ytB) return true;

  // Compare Reddit post & comment IDs
  const redA = trimmedA.match(/reddit\.com\/r\/[^/\s]+\/comments\/([a-zA-Z0-9]+)/i)?.[1] || trimmedA.match(/redd\.it\/([a-zA-Z0-9]+)/i)?.[1];
  const redB = trimmedB.match(/reddit\.com\/r\/[^/\s]+\/comments\/([a-zA-Z0-9]+)/i)?.[1] || trimmedB.match(/redd\.it\/([a-zA-Z0-9]+)/i)?.[1];
  if (redA && redB && redA === redB) {
    const commentA = trimmedA.match(/\/comment\/([a-zA-Z0-9]+)/i)?.[1] || trimmedA.match(/comments\/[a-zA-Z0-9]+\/[^/\s]+\/([a-zA-Z0-9]{6,})/i)?.[1];
    const commentB = trimmedB.match(/\/comment\/([a-zA-Z0-9]+)/i)?.[1] || trimmedB.match(/comments\/[a-zA-Z0-9]+\/[^/\s]+\/([a-zA-Z0-9]{6,})/i)?.[1];
    if (!commentA && !commentB) return true;
    if (commentA && commentB && commentA === commentB) return true;
    return false;
  }

  // Compare Pinterest Pin IDs
  const pinA = trimmedA.match(/pinterest\.[a-z.]+\/pin\/(\d+)/i)?.[1] || trimmedA.match(/pin\.it\/([a-zA-Z0-9]+)/i)?.[1];
  const pinB = trimmedB.match(/pinterest\.[a-z.]+\/pin\/(\d+)/i)?.[1] || trimmedB.match(/pin\.it\/([a-zA-Z0-9]+)/i)?.[1];
  if (pinA && pinB && pinA === pinB) return true;

  return false;
}

/**
 * Searches the user's existing bookmarks for a duplicate matching targetUrl.
 */
export function findDuplicateBookmark(bookmarks: Bookmark[], targetUrl: string): Bookmark | undefined {
  if (!targetUrl || !Array.isArray(bookmarks) || bookmarks.length === 0) {
    return undefined;
  }
  return bookmarks.find((bm) => isSameBookmarkUrl(bm.url, targetUrl));
}




