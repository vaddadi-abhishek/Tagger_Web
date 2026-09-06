export interface BottomNavbarTab {
  id: string;
  label: string;
}

interface BottomNavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabs?: BottomNavbarTab[];
  onAddClick?: () => void;
}

const DEFAULT_TABS: BottomNavbarTab[] = [
  { id: "all", label: "All" },
  { id: "x", label: "Twitter / X" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "reddit", label: "Reddit" },
];

export function BottomNavbar({
  activeTab = "all",
  onTabChange,
  tabs = DEFAULT_TABS,
  onAddClick,
}: BottomNavbarProps) {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-max pointer-events-auto"
    >
      <div className="ios-liquid-glass rounded-full p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/60 dark:border-white/15 transition-all duration-300">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                isActive
                  ? "bg-white dark:bg-white text-zinc-900 shadow-md font-semibold scale-100"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Create Bookmark Button at End of List */}
        {onAddClick && (
          <>
            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/15 mx-1 shrink-0" />
            <button
              type="button"
              onClick={onAddClick}
              title="Add new bookmark"
              aria-label="Add new bookmark"
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[var(--primary)] hover:opacity-90 shadow-sm transition-all duration-200 cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-3.5 sm:size-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
