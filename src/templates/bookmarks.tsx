import { useState, useEffect, useRef } from "react";
import type { Bookmark } from "../types/bookmark";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { AddBookmarkModal } from "../components/AddBookmarkModal";
import { EditBookmarkModal } from "../components/EditBookmarkModal";

interface BookmarksScreenProps {
  bookmarks?: Bookmark[];
  onAddBookmark?: (newBookmark: Bookmark) => void;
  onDeleteBookmark?: (id: string) => void;
  onUpdateBookmarkDetails?: (id: string, title: string, description: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  activePlatform?: string;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

function getColumns<T>(items: T[], numCols: number): T[][] {
  const safeCols = Math.max(1, numCols);
  const cols: T[][] = Array.from({ length: safeCols }, () => []);
  items.forEach((item, index) => {
    cols[index % safeCols].push(item);
  });
  return cols;
}

export default function BookmarksScreen({
  bookmarks: externalBookmarks,
  onAddBookmark: externalAddBookmark,
  onDeleteBookmark,
  onUpdateBookmarkDetails,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  activePlatform = "all",
  isAddModalOpen: externalIsAddModalOpen,
  onCloseAddModal,
}: BookmarksScreenProps) {
  const [internalBookmarks, setInternalBookmarks] = useState<Bookmark[]>([]);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [internalIsAddModalOpen, setInternalIsAddModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [numCols, setNumCols] = useState<number>(() => {
    if (typeof window === "undefined") return 4;
    const w = window.innerWidth;
    const pad = w >= 1024 ? 64 : w >= 640 ? 48 : 32;
    const available = Math.max(300, w - pad);
    return Math.max(1, Math.round((available + 16) / 336));
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    const calculateCols = (width: number) => {
      const gap = 16;
      const targetSlot = 336; // 320px target card width + 16px gap
      return Math.max(1, Math.round((width + gap) / targetSlot));
    };

    const updateCols = (width: number) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const nextCols = calculateCols(width);
        setNumCols((prev) => (prev !== nextCols ? nextCols : prev));
      });
    };

    if (container.clientWidth > 0) {
      updateCols(container.clientWidth);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          updateCols(width);
        }
      }
    });

    observer.observe(container);

    const handleResize = () => {
      if (containerRef.current?.clientWidth) {
        updateCols(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isAddModalOpen =
    externalIsAddModalOpen !== undefined
      ? externalIsAddModalOpen
      : internalIsAddModalOpen;

  const handleCloseAddModal = () => {
    if (onCloseAddModal) {
      onCloseAddModal();
    } else {
      setInternalIsAddModalOpen(false);
    }
  };

  const bookmarks = externalBookmarks || internalBookmarks;
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = (term: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(term);
    } else {
      setInternalSearchTerm(term);
    }
  };

  // Filter Bookmarks based strictly on Search Term and active Platform
  const filteredBookmarks = bookmarks.filter((item) => {
    if (activePlatform && activePlatform !== "all") {
      const type = (item.type || "").toLowerCase();
      const url = (item.url || "").toLowerCase();
      const site = (item.site_name || "").toLowerCase();

      if (activePlatform === "x") {
        const isX = type.includes("x") || type.includes("twitter") || url.includes("twitter.com") || url.includes("x.com") || site.includes("twitter");
        if (!isX) return false;
      } else if (activePlatform === "instagram") {
        const isIg = type.includes("instagram") || url.includes("instagram.com") || site.includes("instagram");
        if (!isIg) return false;
      } else if (activePlatform === "linkedin") {
        const isLi = type.includes("linkedin") || url.includes("linkedin.com") || site.includes("linkedin");
        if (!isLi) return false;
      } else if (activePlatform === "reddit") {
        const isReddit = type.includes("reddit") || url.includes("reddit.com") || site.includes("reddit");
        if (!isReddit) return false;
      }
    }

    const cleanSearch = searchTerm.toLowerCase().trim();
    if (!cleanSearch) return true;

    const matchesTitle = item.title.toLowerCase().includes(cleanSearch);
    const matchesDescription = item.description
      ? item.description.toLowerCase().includes(cleanSearch)
      : false;
    const matchesSite = item.site_name
      ? item.site_name.toLowerCase().includes(cleanSearch)
      : false;
    const matchesUrl = item.url.toLowerCase().includes(cleanSearch);
    const matchesDate = Boolean(
      item.created_at && item.created_at.toLowerCase().includes(cleanSearch)
    );

    return matchesTitle || matchesDescription || matchesSite || matchesUrl || matchesDate;
  });

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      if (onDeleteBookmark) {
        onDeleteBookmark(deleteConfirmId);
      } else {
        setInternalBookmarks((prev) => prev.filter((b) => b.id !== deleteConfirmId));
      }
      setDeleteConfirmId(null);
    }
  };

  const handleAddBookmark = (newBookmark: Bookmark) => {
    if (externalAddBookmark) {
      externalAddBookmark(newBookmark);
    } else {
      setInternalBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  const handleSaveBookmarkDetails = (id: string, title: string, description: string) => {
    if (onUpdateBookmarkDetails) {
      onUpdateBookmarkDetails(id, title, description);
    } else {
      setInternalBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, title, description } : b))
      );
    }
  };

  return (
    <div className="w-full relative pb-8">
      {/* Invisible backdrop to dismiss open card dropdown menus */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Bookmarks Dynamic Auto-Fitting Masonry Grid Layout */}
      {filteredBookmarks.length > 0 ? (
        <div
          ref={containerRef}
          className="w-full grid gap-4 items-start"
          style={{
            gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
          }}
        >
          {getColumns(filteredBookmarks, numCols).map((colItems, colIdx) => (
            <div key={`col_${numCols}_${colIdx}`} className="flex flex-col gap-4 min-w-0">
              {colItems.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  isMenuOpen={openMenuId === bookmark.id}
                  onToggleMenu={(id, e) => {
                    e.stopPropagation();
                    setOpenMenuId((prev) => (prev === id ? null : id));
                  }}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onRequestDelete={(id) => setDeleteConfirmId(id)}
                  onRequestEdit={(b) => setEditingBookmark(b)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-4 text-[var(--text)] space-y-2">
          <p className="text-sm font-medium text-[var(--text-h)]">
            {searchTerm ? "No bookmarks match your search." : "No bookmarks saved yet."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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

      {/* Edit Bookmark Title & Description Modal */}
      <EditBookmarkModal
        isOpen={Boolean(editingBookmark)}
        bookmark={editingBookmark}
        onClose={() => setEditingBookmark(null)}
        onSave={handleSaveBookmarkDetails}
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