import { useState } from "react";
import type { RedditBookmark } from "../types/bookmark";
import { MOCK_BOOKMARKS } from "../dummy_data/bookmarksData";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<RedditBookmark[]>(MOCK_BOOKMARKS);
  const [filter, setFilter] = useState<"all" | "images" | "articles">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const cleanSearch = searchTerm.toLowerCase().replace(/^#/, "");

  const filteredBookmarks = bookmarks.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(cleanSearch) ||
      item.subreddit.toLowerCase().includes(cleanSearch) ||
      item.tags.some((t) => t.toLowerCase().replace(/^#/, "").includes(cleanSearch));

    if (filter === "images") return matchesSearch && item.postType === "image";
    if (filter === "articles") return matchesSearch && item.postType !== "image";
    return matchesSearch;
  });

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      setBookmarks((prev) => prev.filter((b) => b.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-8">
      {/* Invisible backdrop to dismiss open dropdown menus */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Header & Controls Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">
            Saved Bookmarks
          </h1>
          <p className="text-sm text-[var(--text)]">
            Saved posts synced with your account
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Filter saved items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
          />

          <div className="flex bg-[var(--code-bg)] border border-[var(--border)] p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("images")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filter === "images"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setFilter("articles")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filter === "articles"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              Text
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarks Responsive 3-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookmarks.map((bookmark) => (
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
          />
        ))}

        {filteredBookmarks.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text)] border border-dashed border-[var(--border)] rounded-2xl">
            No bookmarks found matching your search criteria.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}