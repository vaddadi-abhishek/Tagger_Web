import React, { useMemo } from "react";
import type { Bookmark } from "../types/bookmark";
import { GenericCard } from "./SocialCards/GenericCard";
import { TwitterCard } from "./SocialCards/TwitterCard";
import { RedditCard } from "./SocialCards/RedditCard";
import { InstagramCard } from "./SocialCards/InstagramCard";
import { LinkedInCard } from "./SocialCards/LinkedInCard";
import { YouTubeCard } from "./SocialCards/YouTubeCard";
import { FacebookCard } from "./SocialCards/FacebookCard";

interface BookmarkCardProps {
  bookmark: Bookmark;
  isMenuOpen: boolean;
  onToggleMenu: (id: string, e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onRequestDelete: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
}

function resolveCardType(bookmark: Bookmark): string {
  const rawType = (bookmark.type || "").toLowerCase().trim();
  if (rawType === "x" || rawType === "twitter") return "x";
  if (rawType === "reddit") return "reddit";
  if (rawType === "instagram") return "instagram";
  if (rawType === "linkedin") return "linkedin";
  if (rawType === "youtube") return "youtube";
  if (rawType === "facebook") return "facebook";

  const url = (bookmark.url || "").toLowerCase();
  const site = (bookmark.site_name || "").toLowerCase();

  if (url.includes("twitter.com") || url.includes("x.com") || site.includes("twitter")) return "x";
  if (url.includes("reddit.com") || site.includes("reddit")) return "reddit";
  if (url.includes("instagram.com") || site.includes("instagram")) return "instagram";
  if (url.includes("linkedin.com") || site.includes("linkedin")) return "linkedin";
  if (url.includes("youtube.com") || url.includes("youtu.be") || site.includes("youtube")) return "youtube";
  if (url.includes("facebook.com") || site.includes("facebook")) return "facebook";

  return "generic";
}

export const BookmarkCard = React.memo(function BookmarkCard(props: BookmarkCardProps) {
  const { bookmark } = props;
  const cardType = useMemo(() => resolveCardType(bookmark), [bookmark]);

  // If metadata is actively being fetched in the background, render wireframe skeleton
  if (bookmark.isFetchingMetadata) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[1.75rem] overflow-hidden shadow-xs flex flex-col justify-between animate-pulse">
        <div className="h-48 sm:h-52 w-full bg-slate-200 dark:bg-zinc-800 opacity-60" />
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded-full w-4/5" />
            <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded-full w-3/5" />
            <div className="h-3 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full w-full mt-3" />
            <div className="h-3 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full w-2/3" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-6 w-16 bg-slate-200 dark:bg-zinc-700 opacity-70 rounded-full" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-700 opacity-70 rounded-full" />
          </div>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full" />
          <div className="h-3 w-8 bg-slate-200 dark:bg-zinc-700 opacity-60 rounded-full" />
        </div>
      </div>
    );
  }

  // Dispatch to specific cards - all render natively without any outer box wrapper
  const renderCardBody = () => {
    switch (cardType) {
      case "x":
        return <TwitterCard {...props} />;
      case "reddit":
        return <RedditCard {...props} />;
      case "instagram":
        return <InstagramCard {...props} />;
      case "linkedin":
        return <LinkedInCard {...props} />;
      case "youtube":
        return <YouTubeCard {...props} />;
      case "facebook":
        return <FacebookCard {...props} />;
      default:
        return <GenericCard {...props} />;
    }
  };

  return (
    <div className={`relative ${props.isMenuOpen ? "z-30" : "z-0"} content-auto`}>
      {renderCardBody()}
    </div>
  );
});
