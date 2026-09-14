import { useState, useMemo, useCallback, useDeferredValue, memo } from "react";
import React from "react";
import type { Bookmark } from "../types/bookmark";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { AddBookmarkModal } from "../components/AddBookmarkModal";
import { AiContextModal } from "../components/AiContextModal";
import { PLATFORM_TABS, resolveCardType, matchesPlatform } from "../lib/utils";

/**
 * Pinterest-style fluid masonry container:
 * - Cards flow dynamically into columns (1 / sm:2 / lg:3 / xl:4) with zero vertical gaps
 * - Single flat list keyed by bookmark.id: cards never unmount or jump between DOM trees on filter/delete/add
 * - Perfect vertical packing with break-inside-avoid
 */
const BookmarkColumnsLayout = memo(function BookmarkColumnsLayout({
  bookmarks,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
  onRequestDelete,
  onViewAiContext,
  onGenerateAiContext,
  generatingAiId,
}: {
  bookmarks: Bookmark[];
  openMenuId: string | null;
  onToggleMenu: (id: string, e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onRequestDelete: (id: string) => void;
  onViewAiContext: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  generatingAiId?: string | null;
}) {
  return (
    <div className="w-full columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="break-inside-avoid mb-4">
          <BookmarkCard
            bookmark={bookmark}
            isMenuOpen={openMenuId === bookmark.id}
            onToggleMenu={onToggleMenu}
            onCloseMenu={onCloseMenu}
            onRequestDelete={onRequestDelete}
            onViewAiContext={onViewAiContext}
            onGenerateAiContext={onGenerateAiContext}
            isGeneratingAi={generatingAiId === bookmark.id}
          />
        </div>
      ))}
    </div>
  );
});



interface BookmarksScreenProps {
  bookmarks?: Bookmark[];
  onAddBookmark?: (newBookmark: Bookmark) => void;
  onDeleteBookmark?: (id: string) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  generatingAiId?: string | null;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  activePlatform?: string;
  onPlatformChange?: (platform: string) => void;
  isAddModalOpen?: boolean;
  onOpenAddModal?: () => void;
  onCloseAddModal?: () => void;
}

export default function BookmarksScreen({
  bookmarks: externalBookmarks,
  onAddBookmark: externalAddBookmark,
  onDeleteBookmark,
  onGenerateAiContext,
  generatingAiId,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  activePlatform: externalActivePlatform,
  onPlatformChange: externalOnPlatformChange,
  isAddModalOpen: externalIsAddModalOpen,
  onOpenAddModal: externalOnOpenAddModal,
  onCloseAddModal,
}: BookmarksScreenProps) {
  const [internalBookmarks, setInternalBookmarks] = useState<Bookmark[]>([]);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalActivePlatform, setInternalActivePlatform] = useState("all");
  const [selectedAiBookmark, setSelectedAiBookmark] = useState<Bookmark | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [internalIsAddModalOpen, setInternalIsAddModalOpen] = useState(false);

  const activePlatform =
    externalActivePlatform !== undefined
      ? externalActivePlatform
      : internalActivePlatform;

  const handlePlatformChange = useCallback(
    (platform: string) => {
      if (externalOnPlatformChange) {
        externalOnPlatformChange(platform);
      } else {
        setInternalActivePlatform(platform);
      }
    },
    [externalOnPlatformChange]
  );

  const isAddModalOpen =
    externalIsAddModalOpen !== undefined
      ? externalIsAddModalOpen
      : internalIsAddModalOpen;

  const handleOpenAddModal = useCallback(() => {
    if (externalOnOpenAddModal) {
      externalOnOpenAddModal();
    } else {
      setInternalIsAddModalOpen(true);
    }
  }, [externalOnOpenAddModal]);

  const handleCloseAddModal = useCallback(() => {
    if (onCloseAddModal) {
      onCloseAddModal();
    } else {
      setInternalIsAddModalOpen(false);
    }
  }, [onCloseAddModal]);

  const bookmarks = externalBookmarks || internalBookmarks;
  const rawSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  // React 18 Concurrent Deferred Value: keeps search typing at 120fps without blocking the UI
  const deferredSearchTerm = useDeferredValue(rawSearchTerm);

  const handleClearSearch = useCallback(() => {
    if (externalOnSearchChange) {
      externalOnSearchChange("");
    } else {
      setInternalSearchTerm("");
    }
  }, [externalOnSearchChange]);

  // Filter Bookmarks based strictly on Search Term and active Platform with useMemo
  const filteredBookmarks = useMemo(() => {
    const cleanSearch = deferredSearchTerm.toLowerCase().trim();

    return bookmarks.filter((item) => {
      if (activePlatform && activePlatform !== "all") {
        if (!matchesPlatform(item, activePlatform)) return false;
      }

      if (!cleanSearch) return true;

      const matchesTitle = item.title ? item.title.toLowerCase().includes(cleanSearch) : false;
      const matchesDescription = item.description
        ? item.description.toLowerCase().includes(cleanSearch)
        : false;
      const matchesSite = item.site_name
        ? item.site_name.toLowerCase().includes(cleanSearch)
        : false;
      const matchesUrl = item.url ? item.url.toLowerCase().includes(cleanSearch) : false;
      const matchesDate = Boolean(
        item.created_at && item.created_at.toLowerCase().includes(cleanSearch)
      );
      const matchesAiContext = item.ai_context
        ? item.ai_context.toLowerCase().includes(cleanSearch)
        : false;
      const matchesAiCategory = item.ai_category
        ? item.ai_category.some((cat) => cat.toLowerCase().includes(cleanSearch))
        : false;
      const matchesAiTags = item.ai_tags
        ? item.ai_tags.some((tag) => tag.toLowerCase().includes(cleanSearch))
        : false;
      const matchesVisualEntities = item.visual_entities
        ? item.visual_entities.some((entity) => entity.toLowerCase().includes(cleanSearch))
        : false;
      const matchesOcrText = item.ocr_text
        ? item.ocr_text.toLowerCase().includes(cleanSearch)
        : false;

      return (
        matchesTitle ||
        matchesDescription ||
        matchesSite ||
        matchesUrl ||
        matchesDate ||
        matchesAiContext ||
        matchesAiCategory ||
        matchesAiTags ||
        matchesVisualEntities ||
        matchesOcrText
      );
    });
  }, [bookmarks, activePlatform, deferredSearchTerm]);

  // Count bookmarks matching each platform filter using centralized resolver
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookmarks.length };
    PLATFORM_TABS.forEach((tab) => {
      if (tab.id !== "all") {
        counts[tab.id] = 0;
      }
    });

    bookmarks.forEach((item) => {
      const type = resolveCardType(item);
      counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
  }, [bookmarks]);

  // Stable callbacks for card actions to prevent child re-renders
  const handleToggleMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const handleRequestDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleViewAiContext = useCallback((bookmark: Bookmark) => {
    setSelectedAiBookmark(bookmark);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmId) {
      if (onDeleteBookmark) {
        onDeleteBookmark(deleteConfirmId);
      } else {
        setInternalBookmarks((prev) => prev.filter((b) => b.id !== deleteConfirmId));
      }
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, onDeleteBookmark]);

  const handleAddBookmark = useCallback(
    (newBookmark: Bookmark) => {
      if (externalAddBookmark) {
        externalAddBookmark(newBookmark);
      } else {
        setInternalBookmarks((prev) => [newBookmark, ...prev]);
      }
    },
    [externalAddBookmark]
  );

  return (
    <div className="w-full relative pb-8">
      {/* Invisible backdrop to dismiss open card dropdown menus */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={handleCloseMenu}
        />
      )}

      {/* Top Dashboard Controls Bar: Platform Filters List & Add Bookmark Action Button */}
      <div className="w-full pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Horizontal Platform Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 -my-1 max-w-full">
          {PLATFORM_TABS.map((tab) => {
            const isActive = activePlatform === tab.id;
            const count = platformCounts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePlatformChange(tab.id)}
                className={`group relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none ${isActive
                  ? "bg-gradient-to-r from-[#B5814C] to-[#996533] text-[#FAF8F5] shadow-[0_2px_12px_rgba(181,129,76,0.35)] scale-100"
                  : "bg-[#FAF8F5]/80 dark:bg-[#14110E]/80 text-[#5F5850] dark:text-[#A89F91] border border-[#B5814C]/15 dark:border-[#C88E3E]/15 hover:border-[#B5814C]/35 hover:text-[#211D1A] dark:hover:text-[#FAF8F5] hover:bg-[#B5814C]/10 active:scale-95"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-black/5 dark:bg-white/10 text-[#8C8377] dark:text-[#A89F91] group-hover:bg-[#B5814C]/20 group-hover:text-[#B5814C]"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Primary Action: Add Bookmark Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-[#FAF8F5] bg-gradient-to-r from-[#B5814C] to-[#996533] hover:from-[#C08C56] hover:to-[#A4703D] hover:brightness-105 shadow-[0_3px_14px_rgba(181,129,76,0.3)] hover:shadow-[0_4px_18px_rgba(181,129,76,0.45)] transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Bookmark</span>
          </button>
        </div>
      </div>

      {/* Bookmarks Responsive CSS Grid:
          Grid with items-start ensures cards stay in their deterministic columns and expanding cards do not trigger column re-balancing or empty gaps */}
      {filteredBookmarks.length > 0 ? (
        <BookmarkColumnsLayout
          bookmarks={filteredBookmarks}
          openMenuId={openMenuId}
          onToggleMenu={handleToggleMenu}
          onCloseMenu={handleCloseMenu}
          onRequestDelete={handleRequestDelete}
          onViewAiContext={handleViewAiContext}
          onGenerateAiContext={onGenerateAiContext}
          generatingAiId={generatingAiId}
        />
      ) : (
        <div className="text-center py-24 px-4 text-[var(--text)] space-y-2">
          <p className="text-sm font-medium text-[var(--text-h)]">
            {rawSearchTerm ? "No bookmarks match your search." : "No bookmarks saved yet."}
          </p>
          {rawSearchTerm && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-[var(--primary)] hover:underline font-semibold cursor-pointer inline-block mt-1"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Add New Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAddBookmark={handleAddBookmark}
      />

      {/* AI Context Intelligence Modal */}
      <AiContextModal
        isOpen={Boolean(selectedAiBookmark)}
        bookmark={selectedAiBookmark}
        onClose={() => setSelectedAiBookmark(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}