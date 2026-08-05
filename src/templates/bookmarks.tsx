import { useState, useRef, useEffect } from "react";
import type { RedditBookmark } from "../types/bookmark";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";
import { MOCK_BOOKMARKS } from "../dummy_data/bookmarksData";
import { INITIAL_COLLECTIONS } from "../dummy_data/collectionsData";
import { INITIAL_TAGS } from "../dummy_data/tagsData";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { AddBookmarkModal } from "../components/AddBookmarkModal";

interface BookmarksScreenProps {
  bookmarks?: RedditBookmark[];
  collections?: CollectionItem[];
  tags?: TagItem[];
  onAddBookmark?: (
    newBookmark: RedditBookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => void;
  onDeleteBookmark?: (id: string) => void;
  selectedFilterCollections?: string[];
  onSelectFilterCollectionsChange?: (cols: string[]) => void;
  selectedFilterTags?: string[];
  onSelectFilterTagsChange?: (tags: string[]) => void;
}

export default function BookmarksScreen({
  bookmarks: externalBookmarks,
  collections: externalCollections,
  tags: externalTags,
  onAddBookmark: externalAddBookmark,
  onDeleteBookmark,
  selectedFilterCollections: externalSelectedCollections,
  onSelectFilterCollectionsChange,
  selectedFilterTags: externalSelectedTags,
  onSelectFilterTagsChange,
}: BookmarksScreenProps) {
  const [internalBookmarks, setInternalBookmarks] =
    useState<RedditBookmark[]>(MOCK_BOOKMARKS);
  const [internalSelectedCollections, setInternalSelectedCollections] = useState<string[]>([]);
  const [internalSelectedTags, setInternalSelectedTags] = useState<string[]>([]);

  const bookmarks = externalBookmarks || internalBookmarks;
  const collections = externalCollections || INITIAL_COLLECTIONS;
  const tags = externalTags || INITIAL_TAGS;

  const selectedFilterCollections =
    externalSelectedCollections !== undefined
      ? externalSelectedCollections
      : internalSelectedCollections;

  const setSelectedFilterCollections = (cols: string[]) => {
    if (onSelectFilterCollectionsChange) {
      onSelectFilterCollectionsChange(cols);
    } else {
      setInternalSelectedCollections(cols);
    }
  };

  const selectedFilterTags =
    externalSelectedTags !== undefined
      ? externalSelectedTags
      : internalSelectedTags;

  const setSelectedFilterTags = (tList: string[]) => {
    if (onSelectFilterTagsChange) {
      onSelectFilterTagsChange(tList);
    } else {
      setInternalSelectedTags(tList);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listener to dismiss filter popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Multi-select collection toggle
  const toggleCollectionFilter = (colName: string) => {
    const exists = selectedFilterCollections.some(
      (c) => c.toLowerCase() === colName.toLowerCase()
    );
    if (exists) {
      setSelectedFilterCollections(
        selectedFilterCollections.filter(
          (c) => c.toLowerCase() !== colName.toLowerCase()
        )
      );
    } else {
      setSelectedFilterCollections([...selectedFilterCollections, colName]);
    }
  };

  // Multi-select tag toggle
  const toggleTagFilter = (tagName: string) => {
    const cleanTag = tagName.toLowerCase().replace(/^#/, "");
    const exists = selectedFilterTags.some(
      (t) => t.toLowerCase().replace(/^#/, "") === cleanTag
    );
    if (exists) {
      setSelectedFilterTags(
        selectedFilterTags.filter(
          (t) => t.toLowerCase().replace(/^#/, "") !== cleanTag
        )
      );
    } else {
      setSelectedFilterTags([...selectedFilterTags, tagName]);
    }
  };

  const clearAllFilters = () => {
    setSelectedFilterCollections([]);
    setSelectedFilterTags([]);
  };

  const activeFilterCount =
    selectedFilterCollections.length + selectedFilterTags.length;

  // Filter Bookmarks based on Search Term, Selected Collections, and Selected Tags
  const filteredBookmarks = bookmarks.filter((item) => {
    // 1. Search matching across title, selftext (description), collections, tags, dateStr, createdAt
    const cleanSearch = searchTerm.toLowerCase().trim();
    let matchesSearch = true;
    if (cleanSearch) {
      const cleanSearchNoHash = cleanSearch.replace(/^#/, "");
      const matchesTitle = item.title.toLowerCase().includes(cleanSearch);
      const matchesDescription = item.selftext
        ? item.selftext.toLowerCase().includes(cleanSearch)
        : false;
      const matchesCollection = item.collections?.some((c) =>
        c.toLowerCase().includes(cleanSearch)
      );
      const matchesTag = item.tags.some((t) =>
        t.toLowerCase().replace(/^#/, "").includes(cleanSearchNoHash)
      );
      const matchesDate =
        item.dateStr.toLowerCase().includes(cleanSearch) ||
        item.createdAt.toLowerCase().includes(cleanSearch);

      matchesSearch =
        matchesTitle ||
        matchesDescription ||
        matchesCollection ||
        matchesTag ||
        matchesDate;
    }

    // 2. Multi-select Collection Filter check
    let matchesCollections = true;
    if (selectedFilterCollections.length > 0) {
      matchesCollections = Boolean(
        item.collections?.some((col) =>
          selectedFilterCollections.some(
            (sel) => sel.toLowerCase() === col.toLowerCase()
          )
        )
      );
    }

    // 3. Multi-select Tag Filter check
    let matchesTags = true;
    if (selectedFilterTags.length > 0) {
      matchesTags = item.tags.some((t) => {
        const cleanT = t.toLowerCase().replace(/^#/, "");
        return selectedFilterTags.some(
          (sel) => sel.toLowerCase().replace(/^#/, "") === cleanT
        );
      });
    }

    return matchesSearch && matchesCollections && matchesTags;
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

  const handleAddBookmark = (
    newBookmark: RedditBookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => {
    if (externalAddBookmark) {
      externalAddBookmark(newBookmark, newCol, newTagsList);
    } else {
      setInternalBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-8">
      {/* Invisible backdrop to dismiss open card dropdown menus */}
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

        {/* Search Bar & Filter Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search bookmarks"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pr-8 text-base sm:text-sm rounded-xl bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors leading-normal"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 text-[var(--text)] hover:text-red-500 cursor-pointer p-0.5 text-xs font-bold"
                title="Clear search input"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Popover Button (Themed Light/Dark) */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[var(--code-bg)] border transition-all cursor-pointer ${activeFilterCount > 0 || isFilterMenuOpen
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--accent-bg)] shadow-xs"
                  : "border-[var(--border)] text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-3.5 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4.5h18l-7 8.25v6l-4 2.25v-8.25L3 4.5z"
                />
              </svg>
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="size-4.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-40 bg-[var(--code-bg)] border border-[var(--border)] p-4 rounded-2xl shadow-2xl w-80 sm:w-96 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="font-bold text-[var(--text-h)] text-sm">
                    Filter Bookmarks
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[var(--primary)] hover:underline font-semibold text-xs cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Collections Multi-select Dropdown (Colors matching collection page) */}
                <div className="space-y-2">
                  <label className="font-semibold text-[var(--text-h)] flex items-center justify-between">
                    <span>Collections</span>
                    <span className="text-[10px] opacity-60 font-normal">
                      Multi-select
                    </span>
                  </label>
                  <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 p-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
                    {collections.map((col) => {
                      const isSelected = selectedFilterCollections.some(
                        (c) => c.toLowerCase() === col.name.toLowerCase()
                      );
                      const color = col.color;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleCollectionFilter(col.name)}
                          style={
                            color
                              ? isSelected
                                ? {
                                  backgroundColor: color,
                                  borderColor: color,
                                  color: "#ffffff",
                                }
                                : {
                                  backgroundColor: `${color}18`,
                                  borderColor: `${color}50`,
                                  color: color,
                                }
                              : undefined
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${!color
                              ? isSelected
                                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                                : "bg-[var(--code-bg)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent-border)]"
                              : "hover:opacity-90"
                            }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="size-3.5 shrink-0"
                            style={
                              color
                                ? { color: isSelected ? "#ffffff" : color }
                                : undefined
                            }
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                            />
                          </svg>
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                    {collections.length === 0 && (
                      <span className="text-[11px] text-[var(--text)] opacity-60 italic py-1">
                        No collections available
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags Multi-select Dropdown (Colors matching tag page) */}
                <div className="space-y-2">
                  <label className="font-semibold text-[var(--text-h)] flex items-center justify-between">
                    <span>Tags</span>
                    <span className="text-[10px] opacity-60 font-normal">
                      Multi-select
                    </span>
                  </label>
                  <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 p-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
                    {tags.map((t) => {
                      const isSelected = selectedFilterTags.some(
                        (tag) =>
                          tag.toLowerCase().replace(/^#/, "") ===
                          t.name.toLowerCase().replace(/^#/, "")
                      );
                      const color = t.color;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTagFilter(t.name)}
                          style={
                            color
                              ? isSelected
                                ? {
                                  backgroundColor: color,
                                  borderColor: color,
                                  color: "#ffffff",
                                }
                                : {
                                  backgroundColor: `${color}18`,
                                  borderColor: `${color}50`,
                                  color: color,
                                }
                              : undefined
                          }
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${!color
                              ? isSelected
                                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                                : "bg-[var(--code-bg)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent-border)]"
                              : "hover:opacity-90"
                            }`}
                        >
                          <span className="font-bold">#</span>
                          <span>{t.name.replace(/^#/, "")}</span>
                        </button>
                      );
                    })}
                    {tags.length === 0 && (
                      <span className="text-[11px] text-[var(--text)] opacity-60 italic py-1">
                        No tags available
                      </span>
                    )}
                  </div>
                </div>

                {/* Done Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Selected Filter Badges Bar */}
      {(selectedFilterCollections.length > 0 || selectedFilterTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-[var(--text)] opacity-80">
            Active Filters:
          </span>

          {/* Collection Badges */}
          {selectedFilterCollections.map((colName) => {
            const colObj = collections.find(
              (c) => c.name.toLowerCase() === colName.toLowerCase()
            );
            const color = colObj?.color;
            return (
              <span
                key={`col_${colName}`}
                style={
                  color
                    ? {
                      backgroundColor: `${color}20`,
                      borderColor: `${color}60`,
                      color: color,
                    }
                    : undefined
                }
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border bg-[var(--accent-bg)] text-[var(--primary)] border-[var(--accent-border)]"
              >
                <span>Collection: {colName}</span>
                <button
                  onClick={() => toggleCollectionFilter(colName)}
                  className="hover:text-red-500 cursor-pointer ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            );
          })}

          {/* Tag Badges */}
          {selectedFilterTags.map((tagName) => {
            const tagObj = tags.find(
              (t) =>
                t.name.toLowerCase().replace(/^#/, "") ===
                tagName.toLowerCase().replace(/^#/, "")
            );
            const color = tagObj?.color;
            return (
              <span
                key={`tag_${tagName}`}
                style={
                  color
                    ? {
                      backgroundColor: `${color}20`,
                      borderColor: `${color}60`,
                      color: color,
                    }
                    : undefined
                }
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border bg-[var(--accent-bg)] text-[var(--primary)] border-[var(--accent-border)]"
              >
                <span className="font-bold">#</span>
                <span>{tagName.replace(/^#/, "")}</span>
                <button
                  onClick={() => toggleTagFilter(tagName)}
                  className="hover:text-red-500 cursor-pointer ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            );
          })}

          <button
            onClick={clearAllFilters}
            className="text-xs text-[var(--primary)] hover:underline font-semibold ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

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
            availableCollections={collections}
            availableTags={tags}
          />
        ))}

        {filteredBookmarks.length === 0 && (
          <div className="col-span-full text-center py-16 px-4 text-[var(--text)] border border-dashed border-[var(--border)] rounded-2xl bg-[var(--code-bg)]/50 space-y-3">
            <div className="size-12 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] mx-auto flex items-center justify-center font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[var(--text-h)]">No Bookmarks Found</h3>
            <p className="text-xs max-w-sm mx-auto opacity-80">
              {searchTerm || activeFilterCount > 0
                ? "No bookmarks match your search or selected filters."
                : "You haven't added any bookmarks yet. Click the (+) button at the bottom right to create your first bookmark!"}
            </p>
            {(searchTerm || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  clearAllFilters();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer inline-block mt-2"
              >
                Clear All Filters & Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Circular (+) Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        title="Add new bookmark"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 size-14 rounded-full bg-[var(--primary)] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-[var(--accent-border)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="size-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      {/* Add New Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBookmark={handleAddBookmark}
        availableCollections={collections}
        availableTags={tags}
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