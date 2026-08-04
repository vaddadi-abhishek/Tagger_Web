interface SideNavProps {
  isSideNavOpen: boolean;
  onClose?: () => void;
}

function SideNav({ isSideNavOpen, onClose }: SideNavProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isSideNavOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:static h-full bg-[var(--code-bg)] border-r border-[var(--border)] transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          isSideNavOpen ? "w-60" : "w-0"
        }`}
      >
        <div className="p-5 font-bold flex justify-between items-center text-[var(--text-h)]">
          <span>My App</span>
          <button
            onClick={onClose}
            className="md:hidden text-[var(--text)] hover:text-[var(--text-h)] focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <hr className="border-[var(--border)]" />

        <div className="[&>div>a]:block [&>div>a]:px-5 [&>div>a]:py-3 [&>div>a]:text-[var(--text)] [&>div>a]:hover:bg-[var(--accent-bg)] [&>div>a]:hover:text-[var(--text-h)] transition-colors">
          <div><a href="#">Link 1</a></div>
          <hr className="border-[var(--border)]" />
          <div><a href="#">Link 2</a></div>
          <hr className="border-[var(--border)]" />
          <div><a href="#">Link 3</a></div>
          <hr className="border-[var(--border)]" />
          <div><a href="#">Link 4</a></div>
          <hr className="border-[var(--border)]" />
          <div><a href="#">Link 5</a></div>
        </div>
      </div>
    </>
  );
}

export default SideNav;