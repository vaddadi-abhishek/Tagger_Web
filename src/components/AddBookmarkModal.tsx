import { useState, useRef, useEffect } from "react";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";
import type { RedditBookmark } from "../types/bookmark";

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (
    newBookmark: RedditBookmark,
    newCollection?: CollectionItem,
    newTags?: TagItem[]
  ) => void;
  availableCollections: CollectionItem[];
  availableTags: TagItem[];
}

const COLOR_PALETTE = [
  "#f97316", "#10b981", "#8b5cf6", "#f59e0b",
  "#3b82f6", "#ef4444", "#ec4899", "#06b6d4"
];

export function AddBookmarkModal({
  isOpen,
  onClose,
  onAddBookmark,
  availableCollections,
  availableTags,
}: AddBookmarkModalProps) {
  // Form State
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Collection State (Tag-style structure)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [collectionInput, setCollectionInput] = useState("");
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);

  // Tag State
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const collectionRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setTitle("");
      setDescription("");
      setSelectedCollections([]);
      setCollectionInput("");
      setSelectedTags([]);
      setTagInput("");
    }
  }, [isOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        collectionRef.current &&
        !collectionRef.current.contains(event.target as Node)
      ) {
        setShowCollectionDropdown(false);
      }
      if (tagRef.current && !tagRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtered collection suggestions
  const cleanCollectionQuery = collectionInput.toLowerCase().trim();
  const collectionSuggestions = availableCollections.filter(
    (c) =>
      c.name.toLowerCase().includes(cleanCollectionQuery) &&
      !selectedCollections.includes(c.name)
  );

  // Filtered tag suggestions
  const cleanTagQuery = tagInput.toLowerCase().trim().replace(/^#/, "");
  const tagSuggestions = availableTags.filter(
    (t) =>
      t.name.toLowerCase().replace(/^#/, "").includes(cleanTagQuery) &&
      !selectedTags.includes(t.name)
  );

  // Collection Handlers
  const addCollectionBadge = (name: string) => {
    const trimmed = name.replace(/,/g, "").trim();
    if (trimmed && !selectedCollections.includes(trimmed)) {
      setSelectedCollections((prev) => [...prev, trimmed]);
    }
    setCollectionInput("");
    setShowCollectionDropdown(false);
  };

  const removeCollectionBadge = (name: string) => {
    setSelectedCollections((prev) => prev.filter((c) => c !== name));
  };

  const handleCollectionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (collectionInput.trim()) {
        addCollectionBadge(collectionInput);
      }
    }
  };

  // Tag Handlers
  const addTagBadge = (name: string) => {
    let clean = name.replace(/,/g, "").trim().replace(/^#/, "");
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  const removeTagBadge = (name: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== name));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTagBadge(tagInput);
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Handle any uncommitted typed input in collection/tag fields
    let finalCollections = [...selectedCollections];
    if (collectionInput.trim() && !finalCollections.includes(collectionInput.trim())) {
      finalCollections.push(collectionInput.trim());
    }

    let finalTags = [...selectedTags];
    if (tagInput.trim()) {
      const cleanTyped = tagInput.trim().replace(/^#/, "");
      if (cleanTyped && !finalTags.includes(cleanTyped)) {
        finalTags.push(cleanTyped);
      }
    }

    // Auto-generate title if empty from domain/path
    let computedTitle = title.trim();
    if (!computedTitle) {
      try {
        const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
        computedTitle = parsed.hostname.replace("www.", "") + parsed.pathname;
      } catch {
        computedTitle = url;
      }
    }

    // Determine domain/source
    let sourceName = "web";
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      sourceName = parsed.hostname.replace("www.", "").split(".")[0];
    } catch {
      // fallback
    }

    const createdCollectionObjects: CollectionItem[] = [];
    finalCollections.forEach((colName) => {
      const exists = availableCollections.some(
        (c) => c.name.toLowerCase() === colName.toLowerCase()
      );
      if (!exists) {
        const randomColor =
          COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
        createdCollectionObjects.push({
          id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: colName,
          count: 1,
          color: randomColor,
        });
      }
    });

    const createdTagObjects: TagItem[] = [];
    finalTags.forEach((tagName) => {
      const exists = availableTags.some(
        (t) => t.name.toLowerCase() === tagName.toLowerCase()
      );
      if (!exists) {
        const randomColor =
          COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
        createdTagObjects.push({
          id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: tagName,
          count: 1,
          color: randomColor,
        });
      }
    });

    const isImageUrl = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);

    const newBookmark: RedditBookmark = {
      id: `bm_${Date.now()}`,
      title: computedTitle,
      subreddit: finalCollections[0] ? `r/${finalCollections[0]}` : `r/${sourceName}`,
      source: sourceName,
      author: "u/you",
      createdAt: "Just now",
      dateStr: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      score: 1,
      numComments: 0,
      url: url.startsWith("http") ? url : `https://${url}`,
      permalink: url.startsWith("http") ? url : `https://${url}`,
      thumbnail: isImageUrl
        ? url
        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      postType: isImageUrl ? "image" : "link",
      selftext: description.trim() || undefined,
      tags: finalTags.map((t) => (t.startsWith("#") ? t : `#${t}`)),
      collections: finalCollections,
    };

    onAddBookmark(
      newBookmark,
      createdCollectionObjects[0],
      createdTagObjects
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-h)]">
              Add New Bookmark
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--text)] hover:text-[var(--text-h)] cursor-pointer p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. URL Link (Required) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1">
              <span>URL Link</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors leading-normal"
            />
          </div>

          {/* 2. Title (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text)]">
              Title <span className="opacity-60 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Enter bookmark title (or auto-extracted if empty)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors leading-normal"
            />
          </div>

          {/* 3. Description (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text)]">
              Description <span className="opacity-60 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add notes or summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors leading-normal resize-none"
            />
          </div>

          {/* 4. Add to Collection (Optional, Tag-style structure) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text)]">
              Add to Collection <span className="opacity-60 font-normal">(Optional)</span>
            </label>

            <div className="relative" ref={collectionRef}>
              <div className="min-h-[42px] p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center gap-1.5 focus-within:border-[var(--primary)] transition-colors">
                {/* Collection Badges */}
                {selectedCollections.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--accent-border)]"
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
                        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                      />
                    </svg>
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => removeCollectionBadge(col)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder={
                    selectedCollections.length === 0
                      ? "Type collection & press Enter or comma..."
                      : "Add another..."
                  }
                  value={collectionInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes(",")) {
                      const parts = val.split(",");
                      parts.forEach((p) => {
                        if (p.trim()) addCollectionBadge(p);
                      });
                      setCollectionInput("");
                    } else {
                      setCollectionInput(val);
                      setShowCollectionDropdown(true);
                    }
                  }}
                  onFocus={() => setShowCollectionDropdown(true)}
                  onKeyDown={handleCollectionKeyDown}
                  className="flex-1 min-w-[120px] bg-transparent text-base sm:text-xs text-[var(--text-h)] placeholder-[var(--text)] outline-none py-0.5"
                />
              </div>

              {/* Collection Dropdown Suggestions */}
              {showCollectionDropdown && (collectionInput.trim() || collectionSuggestions.length > 0) && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[var(--code-bg)] border border-[var(--border)] rounded-xl shadow-xl max-h-36 overflow-y-auto py-1 divide-y divide-[var(--border)]">
                  {collectionSuggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => addCollectionBadge(c.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] transition-colors cursor-pointer text-left"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}

                  {collectionInput.trim() &&
                    !availableCollections.some(
                      (c) => c.name.toLowerCase() === collectionInput.toLowerCase().trim()
                    ) && (
                      <button
                        type="button"
                        onClick={() => addCollectionBadge(collectionInput)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--primary)] font-semibold hover:bg-[var(--accent-bg)] transition-colors cursor-pointer text-left"
                      >
                        <span>Create new collection "{collectionInput.trim()}"</span>
                        <span className="text-[10px] uppercase font-bold">+ New</span>
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* 5. Tags (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text)]">
              Tags <span className="opacity-60 font-normal">(Optional)</span>
            </label>

            <div className="relative" ref={tagRef}>
              <div className="min-h-[42px] p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center gap-1.5 focus-within:border-[var(--primary)] transition-colors">
                {/* Tag Badges */}
                {selectedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)]"
                  >
                    <span className="text-[var(--primary)] font-bold">#</span>
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTagBadge(t)}
                      className="hover:text-red-500 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder={
                    selectedTags.length === 0
                      ? "Type tag & press Enter or comma..."
                      : "Add another tag..."
                  }
                  value={tagInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes(",")) {
                      const parts = val.split(",");
                      parts.forEach((p) => {
                        if (p.trim()) addTagBadge(p);
                      });
                      setTagInput("");
                    } else {
                      setTagInput(val);
                      setShowTagDropdown(true);
                    }
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 min-w-[120px] bg-transparent text-base sm:text-xs text-[var(--text-h)] placeholder-[var(--text)] outline-none py-0.5"
                />
              </div>

              {/* Tag Dropdown Suggestions */}
              {showTagDropdown && (tagInput.trim() || tagSuggestions.length > 0) && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[var(--code-bg)] border border-[var(--border)] rounded-xl shadow-xl max-h-36 overflow-y-auto py-1 divide-y divide-[var(--border)]">
                  {tagSuggestions.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => addTagBadge(t.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] transition-colors cursor-pointer text-left"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>#{t.name}</span>
                    </button>
                  ))}

                  {tagInput.trim() &&
                    !availableTags.some(
                      (t) =>
                        t.name.toLowerCase() ===
                        tagInput.toLowerCase().trim().replace(/^#/, "")
                    ) && (
                      <button
                        type="button"
                        onClick={() => addTagBadge(tagInput)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--primary)] font-semibold hover:bg-[var(--accent-bg)] transition-colors cursor-pointer text-left"
                      >
                        <span>Create tag "#{tagInput.trim().replace(/^#/, "")}"</span>
                        <span className="text-[10px] uppercase font-bold">+ New</span>
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-opacity cursor-pointer disabled:opacity-50"
            >
              Add Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
