import { useState, useEffect } from "react";
import type { Bookmark } from "../types/bookmark";
import type { CollectionItem } from "../types/collection";

interface EditCollectionsModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  availableCollections: CollectionItem[];
  onClose: () => void;
  onSave: (id: string, updatedCollections: string[]) => void;
}

export function EditCollectionsModal({
  isOpen,
  bookmark,
  availableCollections,
  onClose,
  onSave,
}: EditCollectionsModalProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [newColName, setNewColName] = useState("");

  useEffect(() => {
    if (bookmark) {
      setSelectedCollections(bookmark.collections || []);
      setNewColName("");
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

  const initialList = (bookmark.collections || [])
    .map((c) => c.toLowerCase().trim())
    .sort();

  const pendingCol = newColName.trim();
  const effectiveCollections =
    pendingCol && !selectedCollections.some((c) => c.toLowerCase() === pendingCol.toLowerCase())
      ? [...selectedCollections, pendingCol]
      : selectedCollections;

  const effectiveList = effectiveCollections
    .map((c) => c.toLowerCase().trim())
    .sort();

  const hasChanges =
    initialList.length !== effectiveList.length ||
    initialList.some((val, index) => val !== effectiveList[index]);

  const toggleCollection = (colName: string) => {
    setSelectedCollections((prev) =>
      prev.some((c) => c.toLowerCase() === colName.toLowerCase())
        ? prev.filter((c) => c.toLowerCase() !== colName.toLowerCase())
        : [...prev, colName]
    );
  };

  const handleAddNewCol = () => {
    if (!pendingCol) return;
    if (!selectedCollections.some((c) => c.toLowerCase() === pendingCol.toLowerCase())) {
      setSelectedCollections((prev) => [...prev, pendingCol]);
    }
    setNewColName("");
  };

  const handleSave = () => {
    let finalCols = [...selectedCollections];
    if (pendingCol && !finalCols.some((c) => c.toLowerCase() === pendingCol.toLowerCase())) {
      finalCols.push(pendingCol);
    }
    if (!hasChanges) return;
    onSave(bookmark.id, finalCols);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left">
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
                  d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-h)]">Edit Collections</h3>
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

        {/* Quick Add Collection Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new collection name..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNewCol()}
            className="flex-1 px-3.5 py-1.5 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            type="button"
            onClick={handleAddNewCol}
            disabled={!pendingCol}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 ${
              pendingCol
                ? "bg-[var(--accent-bg)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white cursor-pointer"
                : "bg-[var(--bg)] text-[var(--text)] opacity-50 cursor-not-allowed border border-[var(--border)]"
            }`}
          >
            + Add
          </button>
        </div>

        {/* Collections Checklist */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {availableCollections.length === 0 && selectedCollections.length === 0 && (
            <p className="text-xs text-[var(--text)] opacity-70 text-center py-4">
              No collections available. Create one above!
            </p>
          )}

          {Array.from(
            new Set([
              ...availableCollections.map((c) => c.name),
              ...selectedCollections,
            ])
          ).map((colName) => {
            const isChecked = selectedCollections.some(
              (c) => c.toLowerCase() === colName.toLowerCase()
            );
            const matchedObj = availableCollections.find(
              (c) => c.name.toLowerCase() === colName.toLowerCase()
            );
            const color = matchedObj?.color || "#f97316";

            return (
              <label
                key={colName}
                onClick={() => toggleCollection(colName)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? "bg-[var(--accent-bg)]/30 border-[var(--primary)] text-[var(--text-h)]"
                    : "bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent-border)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-semibold">{colName}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="size-4 rounded accent-[var(--primary)] cursor-pointer"
                />
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
            Save Collections
          </button>
        </div>
      </div>
    </div>
  );
}
