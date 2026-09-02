import React from "react";
import type { Bookmark } from "../types/bookmark";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";

import { SocialCardWrapper } from "./SocialCards/SocialCardWrapper";
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
  onRequestEditCollections?: (bookmark: Bookmark) => void;
  onRequestEditTags?: (bookmark: Bookmark) => void;
  availableCollections?: CollectionItem[];
  availableTags?: TagItem[];
}

export function BookmarkCard(props: BookmarkCardProps) {
  const { bookmark } = props;

  // If metadata is actively being fetched in the background, render clean wireframe skeleton
  if (bookmark.isFetchingMetadata) {
    return (
      <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-[1.75rem] overflow-hidden shadow-xs flex flex-col justify-between animate-pulse">
        <div className="h-48 sm:h-52 w-full bg-[var(--border)] opacity-60" />
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="h-4 bg-[var(--border)] rounded-full w-4/5" />
            <div className="h-4 bg-[var(--border)] rounded-full w-3/5" />
            <div className="h-3 bg-[var(--border)] opacity-60 rounded-full w-full mt-3" />
            <div className="h-3 bg-[var(--border)] opacity-60 rounded-full w-2/3" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-6 w-16 bg-[var(--border)] opacity-70 rounded-full" />
            <div className="h-6 w-20 bg-[var(--border)] opacity-70 rounded-full" />
          </div>
        </div>
        <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between">
          <div className="h-3 w-20 bg-[var(--border)] opacity-60 rounded-full" />
          <div className="h-3 w-8 bg-[var(--border)] opacity-60 rounded-full" />
        </div>
      </div>
    );
  }

  // Dispatch to specific cards
  const renderCardBody = () => {
    switch (bookmark.type) {
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
        return <GenericCard bookmark={bookmark} />;
    }
  };

  const isSelfContained =
    bookmark.type === "x" ||
    bookmark.type === "reddit" ||
    bookmark.type === "linkedin" ||
    bookmark.type === "instagram" ||
    bookmark.type === "youtube" ||
    bookmark.type === "facebook";

  return (
    <div className={`relative h-full rounded-[1.75rem] card-hover-glow ${props.isMenuOpen ? "z-30" : "z-0"}`}>
      {isSelfContained ? (
        renderCardBody()
      ) : (
        <SocialCardWrapper {...props}>
          {renderCardBody()}
        </SocialCardWrapper>
      )}
    </div>
  );
}
