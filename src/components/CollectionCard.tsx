import { useState } from "react";
import type { CollectionItem } from "../types/collection";

interface CollectionCardProps {
  collection: CollectionItem;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, newColor: string) => void;
}

const COLOR_PALETTE = [
  "#f97316", // orange
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // red
  "#ec4899", // pink
];

export function CollectionCard({
  collection,
  onRename,
  onDelete,
  onColorChange,
}: CollectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(collection.name);
  const [showMobilePicker, setShowMobilePicker] = useState(false);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onRename(collection.id, nameInput.trim());
    } else {
      setNameInput(collection.name);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)] hover:border-[var(--accent-border)] hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Header: Folder Icon Badge + Responsive Color Controls */}
      <div className="flex items-center justify-between">
        <div
          className="size-11 rounded-xl flex items-center justify-center transition-colors"
          style={{ backgroundColor: `${collection.color}20` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="size-6 transition-transform group-hover:scale-110"
            style={{ color: collection.color }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
            />
          </svg>
        </div>

        {/* DESKTOP (md+): Color Palette shown ONLY on Hover */}
        <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {COLOR_PALETTE.map((hex) => (
            <button
              key={hex}
              onClick={() => onColorChange(collection.id, hex)}
              title="Change color"
              className={`size-3 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                collection.color === hex ? "ring-2 ring-offset-1 ring-[var(--primary)] scale-110" : ""
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>

        {/* MOBILE (<md): Single Applied Color Dot at Top-Right + Click Popover */}
        <div className="relative md:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMobilePicker((prev) => !prev);
            }}
            title="Change color"
            className="size-4.5 rounded-full border border-[var(--border)] shadow-sm cursor-pointer transition-transform active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: collection.color }}
          />

          {showMobilePicker && (
            <div className="absolute right-0 top-6 z-30 bg-[var(--code-bg)] border border-[var(--border)] rounded-full p-1.5 shadow-xl flex items-center gap-1.5">
              {COLOR_PALETTE.map((hex) => (
                <button
                  key={hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange(collection.id, hex);
                    setShowMobilePicker(false);
                  }}
                  className={`size-3.5 rounded-full transition-transform cursor-pointer ${
                    collection.color === hex ? "ring-2 ring-offset-1 ring-[var(--primary)] scale-110" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Title & Bookmark Count */}
      <div className="space-y-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              autoFocus
              className="w-full px-3 py-1 text-base sm:text-sm rounded-lg bg-[var(--bg)] border border-[var(--primary)] text-[var(--text-h)] outline-none"
            />
            <button
              onClick={handleSaveName}
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              Save
            </button>
          </div>
        ) : (
          <h3 className="text-base font-bold text-[var(--text-h)] line-clamp-1">
            {collection.name}
          </h3>
        )}

        <p className="text-xs text-[var(--text)] opacity-75 font-medium">
          {collection.count} {collection.count === 1 ? "bookmark" : "bookmarks"}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)] text-xs font-semibold">
        <button
          onClick={() => {
            if (isEditing) {
              handleSaveName();
            } else {
              setIsEditing(true);
            }
          }}
          className="text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer"
        >
          {isEditing ? "Cancel" : "Rename"}
        </button>
        <button
          onClick={() => onDelete(collection.id)}
          className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
