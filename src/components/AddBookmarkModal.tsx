import { useState, useEffect, useCallback } from "react";
import type { Bookmark } from "../types/bookmark";

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (newBookmark: Bookmark) => void;
}

export function AddBookmarkModal({
  isOpen,
  onClose,
  onAddBookmark,
}: AddBookmarkModalProps) {
  const [url, setUrl] = useState("");

  const handleClose = useCallback(() => {
    setUrl("");
    onClose();
  }, [onClose]);

  // Keyboard shortcut listener for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let formattedUrlStr = trimmedUrl;
    if (!/^https?:\/\//i.test(formattedUrlStr)) {
      formattedUrlStr = `https://${formattedUrlStr}`;
    }

    let sourceName = "Web";
    let computedTitle = "New Bookmark";
    try {
      const parsedUrl = new URL(formattedUrlStr);
      sourceName = parsedUrl.hostname.replace(/^www\./, "");
      computedTitle = sourceName;
    } catch {
      // invalid URL structure fallback
    }

    const isImageUrl = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(formattedUrlStr);

    const newBookmark: Bookmark = {
      id: `bm_${Date.now()}`,
      url: formattedUrlStr,
      title: computedTitle,
      description: "",
      logo: null,
      site_name: sourceName,
      tags: [],
      collections: [],
      created_at: new Date().toISOString(),
      isFetchingMetadata: true,
      card_data: isImageUrl
        ? {
            snapshot: formattedUrlStr,
            author: null,
            published_at: null,
            site_name: sourceName,
            type: "image",
          }
        : undefined,
    };

    setUrl("");
    onAddBookmark(newBookmark);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal rounded-3xl p-6 max-w-lg w-full space-y-5 my-8 animate-in zoom-in-95 duration-200">
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
            onClick={handleClose}
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
          {/* URL Link Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <span>URL Link</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Paste any link (e.g. https://x.com/post, https://github.com/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all font-mono"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="absolute right-3 text-[var(--text)] hover:text-[var(--text-h)] p-1 text-xs cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Add Bookmark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
