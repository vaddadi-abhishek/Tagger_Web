interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-6 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[var(--text-h)]">
            Delete Bookmark?
          </h3>
          <p className="text-xs text-[var(--text)] leading-relaxed">
            Are you sure you want to delete this bookmark? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-md transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
