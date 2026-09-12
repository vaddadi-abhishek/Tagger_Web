import { useState, useMemo, useCallback, useDeferredValue, useEffect, memo } from "react";
import React from "react";
import type { Bookmark } from "../types/bookmark";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { AddBookmarkModal } from "../components/AddBookmarkModal";
import { AiContextModal } from "../components/AiContextModal";

/** Responsive column count matching Tailwind breakpoints: 1 / sm:2 / lg:3 / xl:4 */
function useColumnCount() {
  const getCount = () => {
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  };

  const [cols, setCols] = useState(getCount);

  useEffect(() => {
    const onResize = () => setCols(getCount());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return cols;
}

/**
 * Tight-packing waterfall layout that distributes cards into fixed columns
 * in row-first reading order (card1→col1, card2→col2, card3→col3, card4→col4, card5→col1, ...).
 *
 * Each column is an independent flex container so:
 *  - Cards pack tightly with no vertical gaps between rows
 *  - Expanding a card only pushes items below it in the same column
 *  - Cards never jump between columns on expand/collapse/add/remove
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
  const colCount = useColumnCount();

  // Distribute bookmarks round-robin across columns (row-first order)
  const columns = useMemo(() => {
    const cols: Bookmark[][] = Array.from({ length: colCount }, () => []);
    bookmarks.forEach((bm, i) => {
      cols[i % colCount].push(bm);
    });
    return cols;
  }, [bookmarks, colCount]);

  return (
    <div
      className="w-full grid gap-4"
      style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
    >
      {columns.map((colBookmarks, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {colBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              isMenuOpen={openMenuId === bookmark.id}
              onToggleMenu={onToggleMenu}
              onCloseMenu={onCloseMenu}
              onRequestDelete={onRequestDelete}
              onViewAiContext={onViewAiContext}
              onGenerateAiContext={onGenerateAiContext}
              isGeneratingAi={generatingAiId === bookmark.id}
            />
          ))}
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
  isAddModalOpen?: boolean;
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
  activePlatform = "all",
  isAddModalOpen: externalIsAddModalOpen,
  onCloseAddModal,
}: BookmarksScreenProps) {
  const [internalBookmarks, setInternalBookmarks] = useState<Bookmark[]>([]);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [selectedAiBookmark, setSelectedAiBookmark] = useState<Bookmark | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [internalIsAddModalOpen, setInternalIsAddModalOpen] = useState(false);

  const isAddModalOpen =
    externalIsAddModalOpen !== undefined
      ? externalIsAddModalOpen
      : internalIsAddModalOpen;

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
        const type = (item.type || "").toLowerCase();
        const url = (item.url || "").toLowerCase();
        const site = (item.site_name || "").toLowerCase();

        if (activePlatform === "x") {
          const isX =
            type.includes("x") ||
            type.includes("twitter") ||
            url.includes("twitter.com") ||
            url.includes("x.com") ||
            site.includes("twitter");
          if (!isX) return false;
        } else if (activePlatform === "instagram") {
          const isIg =
            type.includes("instagram") ||
            url.includes("instagram.com") ||
            site.includes("instagram");
          if (!isIg) return false;
        } else if (activePlatform === "facebook") {
          const isFb =
            type.includes("facebook") ||
            url.includes("facebook.com") ||
            url.includes("fb.watch") ||
            url.includes("fb.com") ||
            site.includes("facebook");
          if (!isFb) return false;
        } else if (activePlatform === "linkedin") {
          const isLi =
            type.includes("linkedin") ||
            url.includes("linkedin.com") ||
            site.includes("linkedin");
          if (!isLi) return false;
        } else if (activePlatform === "reddit") {
          const isReddit =
            type.includes("reddit") ||
            url.includes("reddit.com") ||
            site.includes("reddit");
          if (!isReddit) return false;
        }
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
        matchesAiTags ||
        matchesVisualEntities ||
        matchesOcrText
      );
    });
  }, [bookmarks, activePlatform, deferredSearchTerm]);

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