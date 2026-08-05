import React from "react";
import type { RedditBookmark } from "../types/bookmark";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";

interface BookmarkCardProps {
  bookmark: RedditBookmark;
  isMenuOpen: boolean;
  onToggleMenu: (id: string, e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onRequestDelete: (id: string) => void;
  availableCollections?: CollectionItem[];
  availableTags?: TagItem[];
}

export function BookmarkCard({
  bookmark,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onRequestDelete,
  availableCollections,
  availableTags,
}: BookmarkCardProps) {
  return (
    <div className="group relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow)] hover:border-[var(--accent-border)] hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Media Image Section */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[var(--bg)]">
        <img
          src={bookmark.thumbnail}
          alt={bookmark.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Right Source Badge */}
        <div className="absolute top-3 right-3 rounded-full px-3 py-1 bg-black/60 backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5 shadow-md">
          <span className="size-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
          <span>{bookmark.source}</span>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <a
            href={bookmark.url || bookmark.permalink}
            target="_blank"
            rel="noreferrer"
            className="text-base font-bold text-[var(--text-h)] hover:text-[var(--primary)] transition-colors leading-snug block line-clamp-2"
          >
            {bookmark.title}
          </a>

          {bookmark.selftext && (
            <p className="text-xs text-[var(--text)] line-clamp-2 leading-relaxed opacity-90">
              {bookmark.selftext}
            </p>
          )}
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {bookmark.tags.map((tag, idx) => {
            const cleanTag = tag.replace(/^#/, "");
            const tagObj = availableTags?.find(
              (t) => t.name.toLowerCase().replace(/^#/, "") === cleanTag.toLowerCase()
            );
            const color = tagObj?.color;

            return (
              <span
                key={idx}
                style={
                  color
                    ? {
                        backgroundColor: `${color}18`,
                        borderColor: `${color}50`,
                        color: color,
                      }
                    : undefined
                }
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer group/tag border ${
                  !color
                    ? "bg-[var(--accent-bg)] text-[var(--primary)] border-[var(--accent-border)] hover:bg-[var(--primary)] hover:text-white"
                    : "hover:opacity-80"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="size-3.5 shrink-0 transition-transform group-hover/tag:scale-110"
                  style={color ? { color: color } : undefined}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6z"
                  />
                </svg>
                <span>{cleanTag}</span>
              </span>
            );
          })}
        </div>

        {/* Collections Row (Below Tags) */}
        {bookmark.collections && bookmark.collections.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {bookmark.collections.map((col, idx) => {
              const colObj = availableCollections?.find(
                (c) => c.name.toLowerCase() === col.toLowerCase()
              );
              const color = colObj?.color;

              return (
                <span
                  key={idx}
                  style={
                    color
                      ? {
                          backgroundColor: `${color}18`,
                          borderColor: `${color}50`,
                          color: color,
                        }
                      : undefined
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer group/col ${
                    !color
                      ? "bg-[var(--bg)] text-[var(--text-h)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      : "hover:opacity-80"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-3.5 shrink-0 transition-transform group-hover/col:scale-110"
                    style={color ? { color: color } : undefined}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                    />
                  </svg>
                  <span>{col}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text)]">
        <span>{bookmark.dateStr}</span>

        <div className="flex items-center gap-2">
          {bookmark.url && (
            <a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              title="Open Source Link"
              className="p-1.5 rounded-lg hover:bg-[var(--bg)] hover:text-[var(--primary)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          )}

          {/* 3-Dots Options Menu Dropdown Container */}
          <div className="relative">
            <button
              onClick={(e) => onToggleMenu(bookmark.id, e)}
              title="More options"
              className="p-1.5 rounded-lg hover:bg-[var(--bg)] hover:text-[var(--text-h)] transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4 pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 bottom-8 w-48 bg-[var(--code-bg)] border border-[var(--border)] rounded-xl shadow-xl p-1.5 z-30 text-xs font-medium text-[var(--text-h)]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-4 shrink-0 text-[var(--primary)] pointer-events-none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  <span className="pointer-events-none">Edit bookmark</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-4 shrink-0 text-[var(--primary)] pointer-events-none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                    />
                  </svg>
                  <span className="pointer-events-none">Manage Collections</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-4 shrink-0 text-[var(--primary)] pointer-events-none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                  <span className="pointer-events-none">Edit Tags</span>
                </button>
                <hr className="my-1 border-[var(--border)]" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete(bookmark.id);
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer font-semibold flex items-center gap-2.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-4 shrink-0 pointer-events-none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  <span className="pointer-events-none">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
