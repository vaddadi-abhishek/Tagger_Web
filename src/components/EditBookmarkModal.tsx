import { useState, useEffect } from "react";
import type { Bookmark } from "../types/bookmark";

interface EditBookmarkModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  onClose: () => void;
  onSave: (id: string, newTitle: string, newDescription: string) => void;
}

export function EditBookmarkModal({
  isOpen,
  bookmark,
  onClose,
  onSave,
}: EditBookmarkModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title || "");
      setDescription(bookmark.description || "");
    }
  }, [bookmark]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bookmark) return null;

  const initialTitle = bookmark.title || "";
  const initialDescription = bookmark.description || "";

  const hasChanges =
    title.trim() !== initialTitle.trim() ||
    description.trim() !== initialDescription.trim();

  const hasValidTitle = title.trim().length > 0;
  const isSaveDisabled = !hasChanges || !hasValidTitle;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaveDisabled) return;
    onSave(bookmark.id, title.trim(), description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-modal rounded-3xl p-6 max-w-lg w-full space-y-5 text-left animate-in zoom-in-95 duration-200">
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
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-h)]">Edit Bookmark</h3>
              <p className="text-xs text-[var(--text)] opacity-75">Update title and description</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-h)] block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title..."
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] opacity-90 outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-h)] block">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] opacity-90 outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaveDisabled}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                !isSaveDisabled
                  ? "bg-[var(--primary)] text-white hover:opacity-90 shadow-md cursor-pointer opacity-100"
                  : "bg-[var(--border)] text-[var(--text)] opacity-50 cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
