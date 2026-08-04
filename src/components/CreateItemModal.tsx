import { useState } from "react";

interface CreateItemModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

const COLOR_OPTIONS = [
  "#f97316", // orange
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export function CreateItemModal({
  isOpen,
  title,
  placeholder,
  onClose,
  onCreate,
}: CreateItemModalProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), selectedColor);
      setName("");
      setSelectedColor(COLOR_OPTIONS[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-h)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--text)] hover:text-[var(--text-h)] cursor-pointer"
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Name
            </label>
            <input
              type="text"
              placeholder={placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Color Theme
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`size-6 rounded-full transition-transform cursor-pointer ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-[var(--primary)] scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-opacity cursor-pointer disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
