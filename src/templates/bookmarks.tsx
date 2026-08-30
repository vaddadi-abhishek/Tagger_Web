import { useState, useRef, useEffect } from "react";
import type { Bookmark } from "../types/bookmark";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";
import { BookmarkCard } from "../components/BookmarkCard";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { AddBookmarkModal } from "../components/AddBookmarkModal";
import { EditBookmarkModal } from "../components/EditBookmarkModal";
import { EditCollectionsModal } from "../components/EditCollectionsModal";
import { EditTagsModal } from "../components/EditTagsModal";

interface BookmarksScreenProps {
  bookmarks?: Bookmark[];
  collections?: CollectionItem[];
  tags?: TagItem[];
  onAddBookmark?: (
    newBookmark: Bookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => void;
  onDeleteBookmark?: (id: string) => void;
  onUpdateBookmarkDetails?: (id: string, title: string, description: string) => void;
  onUpdateBookmarkCollections?: (id: string, collections: string[]) => void;
  onUpdateBookmarkTags?: (id: string, tags: string[]) => void;
  selectedFilterCollections?: string[];
  onSelectFilterCollectionsChange?: (cols: string[]) => void;
  selectedFilterTags?: string[];
  onSelectFilterTagsChange?: (tags: string[]) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

function getColumns<T>(items: T[], numCols: number): T[][] {
  const cols: T[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, index) => {
    cols[index % numCols].push(item);
  });
  return cols;
}

export default function BookmarksScreen({
  bookmarks: externalBookmarks,
  collections: externalCollections,
  tags: externalTags,
  onAddBookmark: externalAddBookmark,
  onDeleteBookmark,
  onUpdateBookmarkDetails,
  onUpdateBookmarkCollections,
  onUpdateBookmarkTags,
  selectedFilterCollections: externalSelectedCollections,
  onSelectFilterCollectionsChange,
  selectedFilterTags: externalSelectedTags,
  onSelectFilterTagsChange,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
}: BookmarksScreenProps) {
  const [internalBookmarks, setInternalBookmarks] =
    useState<Bookmark[]>([]);
  const [internalSelectedCollections, setInternalSelectedCollections] = useState<string[]>([]);
  const [internalSelectedTags, setInternalSelectedTags] = useState<string[]>([]);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingCollectionsBookmark, setEditingCollectionsBookmark] = useState<Bookmark | null>(null);
  const [editingTagsBookmark, setEditingTagsBookmark] = useState<Bookmark | null>(null);

  const bookmarks = externalBookmarks || internalBookmarks;
  const collections = externalCollections || [];
  const tags = externalTags || [];

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = (term: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(term);
    } else {
      setInternalSearchTerm(term);
    }
  };

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
    // 1. Search matching across title, description, site_name, url, collections, tags, created_at
    const cleanSearch = searchTerm.toLowerCase().trim();
    let matchesSearch = true;
    if (cleanSearch) {
      const cleanSearchNoHash = cleanSearch.replace(/^#/, "");
      const matchesTitle = item.title.toLowerCase().includes(cleanSearch);
      const matchesDescription = item.description
        ? item.description.toLowerCase().includes(cleanSearch)
        : false;
      const matchesSite = item.site_name
        ? item.site_name.toLowerCase().includes(cleanSearch)
        : false;
      const matchesUrl = item.url.toLowerCase().includes(cleanSearch);
      const matchesCollection = item.collections?.some((c) =>
        c.toLowerCase().includes(cleanSearch)
      );
      const matchesTag = item.tags.some((t) =>
        t.toLowerCase().replace(/^#/, "").includes(cleanSearchNoHash)
      );
      const matchesDate = Boolean(
        item.created_at && item.created_at.toLowerCase().includes(cleanSearch)
      );

      matchesSearch =
        matchesTitle ||
        matchesDescription ||
        matchesSite ||
        matchesUrl ||
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
    newBookmark: Bookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => {
    if (externalAddBookmark) {
      externalAddBookmark(newBookmark, newCol, newTagsList);
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

  const handleSaveBookmarkCollections = (id: string, newCollections: string[]) => {
    if (onUpdateBookmarkCollections) {
      onUpdateBookmarkCollections(id, newCollections);
    } else {
      setInternalBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, collections: newCollections } : b))
      );
    }
  };

  const handleSaveBookmarkTags = (id: string, newTags: string[]) => {
    if (onUpdateBookmarkTags) {
      onUpdateBookmarkTags(id, newTags);
    } else {
      setInternalBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, tags: newTags } : b))
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 relative pb-8">
      {/* Invisible backdrop to dismiss open card dropdown menus */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Controls Section: Filter Badges on Left, Filter Button on Right */}
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Bookmarks Count & Active Selected Filter Badges Bar */}
        <div className="flex flex-wrap items-center gap-2.5 min-h-[36px]">
          <span className="text-sm font-semibold text-[var(--text-h)]">
            Bookmarks ({bookmarks.length})
          </span>

          {activeFilterCount > 0 && (
            <>
              <span className="text-xs text-[var(--border)] font-light">|</span>
              <span className="text-xs font-semibold text-[var(--text)] opacity-80">
                Filters:
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
                className="text-xs text-[var(--primary)] hover:underline font-semibold ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Right Side: Filter Popover Button (Themed Light/Dark) */}
        <div className="relative shrink-0" ref={filterMenuRef}>
          <button
            onClick={() => setIsFilterMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[var(--code-bg)] border transition-all cursor-pointer ${
              activeFilterCount > 0 || isFilterMenuOpen
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
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          !color
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
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                          !color
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

      {/* Horizontal Line Break */}
      <hr className="border-[var(--border)] my-2" />

      {/* Bookmarks Fixed-Column Masonry Grid Layout (Preserves Strict Card Order) */}
      {filteredBookmarks.length > 0 ? (
        <>
          {/* Mobile View: 1 Column */}
          <div className="flex flex-col gap-6 sm:hidden">
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
                onRequestEdit={(b) => setEditingBookmark(b)}
                onRequestEditCollections={(b) => setEditingCollectionsBookmark(b)}
                onRequestEditTags={(b) => setEditingTagsBookmark(b)}
                availableCollections={collections}
                availableTags={tags}
              />
            ))}
          </div>

          {/* Tablet View: 2 Fixed Columns */}
          <div className="hidden sm:grid lg:hidden grid-cols-2 gap-6 items-start">
            {getColumns(filteredBookmarks, 2).map((colItems, colIdx) => (
              <div key={`tab_col_${colIdx}`} className="flex flex-col gap-6">
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
                    onRequestEditCollections={(b) => setEditingCollectionsBookmark(b)}
                    onRequestEditTags={(b) => setEditingTagsBookmark(b)}
                    availableCollections={collections}
                    availableTags={tags}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Desktop View: 3 Fixed Columns */}
          <div className="hidden lg:grid grid-cols-3 gap-6 items-start">
            {getColumns(filteredBookmarks, 3).map((colItems, colIdx) => (
              <div key={`desk_col_${colIdx}`} className="flex flex-col gap-6">
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
                    onRequestEditCollections={(b) => setEditingCollectionsBookmark(b)}
                    onRequestEditTags={(b) => setEditingTagsBookmark(b)}
                    availableCollections={collections}
                    availableTags={tags}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 px-4 text-[var(--text)] border border-dashed border-[var(--border)] rounded-2xl bg-[var(--code-bg)]/50 space-y-3">
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

      {/* Edit Bookmark Title & Description Modal */}
      <EditBookmarkModal
        isOpen={Boolean(editingBookmark)}
        bookmark={editingBookmark}
        onClose={() => setEditingBookmark(null)}
        onSave={handleSaveBookmarkDetails}
      />

      {/* Edit Collections Modal */}
      <EditCollectionsModal
        isOpen={Boolean(editingCollectionsBookmark)}
        bookmark={editingCollectionsBookmark}
        availableCollections={collections}
        onClose={() => setEditingCollectionsBookmark(null)}
        onSave={handleSaveBookmarkCollections}
      />

      {/* Edit Tags Modal */}
      <EditTagsModal
        isOpen={Boolean(editingTagsBookmark)}
        bookmark={editingTagsBookmark}
        availableTags={tags}
        onClose={() => setEditingTagsBookmark(null)}
        onSave={handleSaveBookmarkTags}
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