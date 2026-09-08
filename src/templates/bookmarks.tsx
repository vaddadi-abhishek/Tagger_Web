import { useState, useMemo, useCallback, useDeferredValue } from "react";
import type { Bookmark } from "../types/bookmark";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { AddBookmarkModal } from "../components/AddBookmarkModal";
import { AiContextModal } from "../components/AiContextModal";

interface BookmarksScreenProps {
  bookmarks?: Bookmark[];
  onAddBookmark?: (newBookmark: Bookmark) => void;
  onDeleteBookmark?: (id: string) => void;
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

      {/* Bookmarks Native CSS Multi-Column Masonry Grid:
          Keeps all cards inside a single container so matching cards never unmount or reload images on filter changes */}
      {filteredBookmarks.length > 0 ? (
        <div className="w-full columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="break-inside-avoid mb-4">
              <BookmarkCard
                bookmark={bookmark}
                isMenuOpen={openMenuId === bookmark.id}
                onToggleMenu={handleToggleMenu}
                onCloseMenu={handleCloseMenu}
                onRequestDelete={handleRequestDelete}
                onViewAiContext={handleViewAiContext}
              />
            </div>
          ))}
        </div>
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