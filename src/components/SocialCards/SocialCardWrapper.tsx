import React from "react";
import type { Bookmark } from "../../types/bookmark";
import type { CollectionItem } from "../../types/collection";
import type { TagItem } from "../../types/tag";

interface SocialCardWrapperProps {
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
  children: React.ReactNode;
}

export function SocialCardWrapper({
  bookmark,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onRequestDelete,
  onRequestEdit,
  onRequestEditCollections,
  onRequestEditTags,
  availableCollections,
  availableTags,
  children,
}: SocialCardWrapperProps) {
  return (
    <div
      className={`group relative glass-panel rounded-[1.75rem] transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isMenuOpen ? "z-30" : "z-0"
      }`}
    >
      {/* Platform Specific Content */}
      <div className="flex-1 flex flex-col">{children}</div>

      {/* Common Metadata Section: Tags & Collections */}
      <div className="px-5 pb-3">
        {/* Tags Row */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 mb-2">
            {bookmark.tags.map((tag, idx) => {
              const cleanTag = tag.replace(/^#/, "");
              const tagObj = availableTags?.find(
                (t) =>
                  t.name.toLowerCase().replace(/^#/, "") ===
                  cleanTag.toLowerCase()
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
                  className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer group/tag border ${
                    !color
                      ? "bg-[var(--accent-bg)] text-[var(--primary)] border-[var(--accent-border)] hover:bg-[var(--primary)] hover:text-white"
                      : "hover:opacity-80"
                  }`}
                >
                  <span>#{cleanTag}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Collections Row */}
        {bookmark.collections && bookmark.collections.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-1">
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-xl border transition-all cursor-pointer group/col ${
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
                    className="size-3 shrink-0"
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
      <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-end text-[11px] text-[var(--text)]">
        <div className="flex items-center gap-2">
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
              <div className="glass-modal absolute right-0 bottom-9 w-52 rounded-3xl p-2 z-40 text-xs font-medium text-[var(--text-h)] animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEdit?.(bookmark);
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-xl transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <span>Edit bookmark</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEditCollections?.(bookmark);
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-xl transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <span>Edit Collections</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEditTags?.(bookmark);
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-xl transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <span>Edit Tags</span>
                </button>
                <hr className="my-1 border-[var(--border)]" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete(bookmark.id);
                    onCloseMenu();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors cursor-pointer font-semibold flex items-center gap-2.5"
                >
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
