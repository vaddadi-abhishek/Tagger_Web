import { useState, useEffect } from "react";
import type { Bookmark } from "../types/bookmark";
import type { TagItem } from "../types/tag";

interface EditTagsModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  availableTags: TagItem[];
  onClose: () => void;
  onSave: (id: string, updatedTags: string[]) => void;
}

export function EditTagsModal({
  isOpen,
  bookmark,
  availableTags,
  onClose,
  onSave,
}: EditTagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (bookmark) {
      setSelectedTags(
        (bookmark.tags || []).map((t) => (t.startsWith("#") ? t : `#${t}`))
      );
      setNewTagName("");
    }
  }, [bookmark, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bookmark) return null;

  const initialList = (bookmark.tags || [])
    .map((t) => t.replace(/^#/, "").toLowerCase().trim())
    .sort();

  const pendingTag = newTagName.replace(/^#/, "").trim();
  const effectiveTags =
    pendingTag &&
    !selectedTags.some((t) => t.replace(/^#/, "").toLowerCase() === pendingTag.toLowerCase())
      ? [...selectedTags, `#${pendingTag}`]
      : selectedTags;

  const effectiveList = effectiveTags
    .map((t) => t.replace(/^#/, "").toLowerCase().trim())
    .sort();

  const hasChanges =
    initialList.length !== effectiveList.length ||
    initialList.some((val, index) => val !== effectiveList[index]);

  const toggleTag = (tagName: string) => {
    const clean = tagName.replace(/^#/, "").toLowerCase();
    setSelectedTags((prev) =>
      prev.some((t) => t.replace(/^#/, "").toLowerCase() === clean)
        ? prev.filter((t) => t.replace(/^#/, "").toLowerCase() !== clean)
        : [...prev, tagName.startsWith("#") ? tagName : `#${tagName}`]
    );
  };

  const handleAddNewTag = () => {
    if (!pendingTag) return;
    const formattedTag = `#${pendingTag}`;
    if (!selectedTags.some((t) => t.replace(/^#/, "").toLowerCase() === pendingTag.toLowerCase())) {
      setSelectedTags((prev) => [...prev, formattedTag]);
    }
    setNewTagName("");
  };

  const handleSave = () => {
    let finalTags = [...selectedTags];
    if (
      pendingTag &&
      !finalTags.some((t) => t.replace(/^#/, "").toLowerCase() === pendingTag.toLowerCase())
    ) {
      finalTags.push(`#${pendingTag}`);
    }
    if (!hasChanges) return;
    onSave(bookmark.id, finalTags);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-modal rounded-3xl p-6 max-w-md w-full space-y-5 text-left animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-5 pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-h)]">Edit Tags</h3>
              <p className="text-xs text-[var(--text)] opacity-75 truncate max-w-[220px]">
                {bookmark.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Add Tag Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new tag (e.g. design)..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNewTag()}
            className="flex-1 px-3.5 py-1.5 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            type="button"
            onClick={handleAddNewTag}
            disabled={!pendingTag}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 ${
              pendingTag
                ? "bg-[var(--accent-bg)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white cursor-pointer"
                : "bg-[var(--bg)] text-[var(--text)] opacity-50 cursor-not-allowed border border-[var(--border)]"
            }`}
          >
            + Add
          </button>
        </div>

        {/* Tags Checklist / Pill Selector */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {availableTags.length === 0 && selectedTags.length === 0 && (
            <p className="text-xs text-[var(--text)] opacity-70 text-center py-4">
              No tags available. Create one above!
            </p>
          )}

          {Array.from(
            new Set([
              ...availableTags.map((t) => (t.name.startsWith("#") ? t.name : `#${t.name}`)),
              ...selectedTags,
            ])
          ).map((rawTag) => {
            const clean = rawTag.replace(/^#/, "");
            const isChecked = selectedTags.some(
              (t) => t.replace(/^#/, "").toLowerCase() === clean.toLowerCase()
            );
            const matchedObj = availableTags.find(
              (t) => t.name.toLowerCase().replace(/^#/, "") === clean.toLowerCase()
            );
            const color = matchedObj?.color || "#10b981";

            return (
              <label
                key={rawTag}
                onClick={() => toggleTag(rawTag)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] hover:border-[var(--accent-border)] transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-semibold">#{clean}</span>
                </div>
                <div
                  className={`size-4.5 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-transparent"
                  }`}
                >
                  {isChecked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                      stroke="currentColor"
                      className="size-3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              hasChanges
                ? "bg-[var(--primary)] text-white hover:opacity-90 shadow-md cursor-pointer opacity-100"
                : "bg-[var(--border)] text-[var(--text)] opacity-50 cursor-not-allowed"
            }`}
          >
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
}
