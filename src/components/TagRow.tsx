import { useState } from "react";
import type { TagItem } from "../types/tag";

interface TagRowProps {
  tag: TagItem;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, newColor: string) => void;
}

const COLOR_PALETTE = [
  "#ef4444", // red
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#a855f7", // purple
  "#f59e0b", // amber
  "#eab308", // yellow
  "#ec4899", // pink
  "#3b82f6", // blue
];

export function TagRow({ tag, onRename, onDelete, onColorChange }: TagRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(tag.name);
  const [showMobilePicker, setShowMobilePicker] = useState(false);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onRename(tag.id, nameInput.trim());
    } else {
      setNameInput(tag.name);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative flex items-center justify-between p-4 bg-[var(--code-bg)] border-b border-[var(--border)] first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 hover:bg-[var(--bg)]/40 transition-colors gap-3">
      {/* Left Info: Tag Icon Badge + Name & Count */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          className="size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
          style={{ backgroundColor: `${tag.color}20` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-4"
            style={{ color: tag.color }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6Z"
            />
          </svg>
        </div>

        <div className="space-y-0.5 min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
                className="w-full px-3 py-1 text-base sm:text-xs rounded-lg bg-[var(--bg)] border border-[var(--primary)] text-[var(--text-h)] outline-none"
              />
              <button
                onClick={handleSaveName}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          ) : (
            <h4 className="text-sm font-bold text-[var(--text-h)] truncate">
              {tag.name}
            </h4>
          )}

          <p className="text-xs text-[var(--text)] opacity-75 font-medium">
            {tag.count} {tag.count === 1 ? "bookmark" : "bookmarks"}
          </p>
        </div>
      </div>

      {/* Right Section: Color Controls + Action Buttons */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* DESKTOP (md+): Color Palette shown ONLY on Hover */}
        <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {COLOR_PALETTE.map((hex) => (
            <button
              key={hex}
              onClick={() => onColorChange(tag.id, hex)}
              title="Change color"
              className={`size-3 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                tag.color === hex ? "ring-2 ring-offset-1 ring-[var(--primary)] scale-110" : ""
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>

        {/* MOBILE (<md): Single Applied Color Dot at Top-Right + Compact Color Selector Popover */}
        <div className="relative md:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMobilePicker((prev) => !prev);
            }}
            title="Change color"
            className="size-4.5 rounded-full border border-[var(--border)] shadow-sm cursor-pointer transition-transform active:scale-95 flex items-center justify-center shrink-0"
            style={{ backgroundColor: tag.color }}
          />

          {showMobilePicker && (
            <div className="absolute right-0 top-7 z-30 bg-[var(--code-bg)] border border-[var(--border)] rounded-xl p-2 shadow-2xl flex items-center gap-1.5 max-w-[calc(100vw-3rem)]">
              {COLOR_PALETTE.map((hex) => (
                <button
                  key={hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange(tag.id, hex);
                    setShowMobilePicker(false);
                  }}
                  className={`size-3.5 rounded-full transition-transform cursor-pointer shrink-0 ${
                    tag.color === hex ? "ring-2 ring-offset-1 ring-[var(--primary)] scale-110" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
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
            onClick={() => onDelete(tag.id)}
            className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
