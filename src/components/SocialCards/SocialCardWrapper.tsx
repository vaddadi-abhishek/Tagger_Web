import React from "react";
import type { Bookmark } from "../../types/bookmark";
import { HorizontalMoreIcon } from "./SocialCardIcons";

interface SocialCardWrapperProps {
  bookmark: Bookmark;
  isMenuOpen: boolean;
  onToggleMenu: (id: string, e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onRequestDelete: (id: string) => void;
  onRequestEdit?: (bookmark: Bookmark) => void;
  children: React.ReactNode;
}

export const SocialCardWrapper = React.memo(function SocialCardWrapper({
  bookmark,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onRequestDelete,
  onRequestEdit,
  children,
}: SocialCardWrapperProps) {
  return (
    <div
      className={`group relative glass-panel rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm ${
        isMenuOpen ? "z-30" : "z-0"
      }`}
    >
      {/* Platform Specific Content */}
      <div className="flex-1 flex flex-col">{children}</div>

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
              <HorizontalMoreIcon />
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
});
