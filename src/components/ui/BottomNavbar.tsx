
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
  { id: "facebook", label: "Facebook" },
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-max pointer-events-auto select-none"
    >
      {/* Main Liquid Mirror Glass Capsule - High clarity, mirror bevels, zero milky blur */}
      <div className="ultra-liquid-glass rounded-full p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar relative transition-all duration-300">
        {/* Specular Liquid Meniscus Curve Highlight */}
        <div
          className="absolute inset-x-2 top-0 h-[38%] rounded-t-full pointer-events-none bg-gradient-to-b from-white/35 via-white/5 to-transparent dark:from-white/15 dark:via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Hairline Mirror Rim Edge Reflection */}
        <div
          className="absolute inset-x-5 top-0 h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/60"
          aria-hidden="true"
        />

        {/* Tab Items (Text Only, No Logos) */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center justify-center z-10 ${
                isActive
                  ? "bg-white dark:bg-white text-[#000000] dark:text-[#000000] shadow-[0_2px_10px_rgba(0,0,0,0.16),inset_0_1px_0.5px_rgba(255,255,255,1)] scale-100 backdrop-blur-md"
                  : "text-[#000000] dark:text-white hover:text-[#000000] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 active:scale-95"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Create Bookmark Button at End of List */}
        {onAddClick && (
          <>
            {/* Mirror Glass Incision Divider */}
            <div className="h-4 w-[1px] bg-gradient-to-b from-transparent via-black/20 dark:via-white/25 to-transparent mx-1 shrink-0 z-10" />

            <button
              type="button"
              onClick={onAddClick}
              title="Add new bookmark"
              aria-label="Add new bookmark"
              className="relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 hover:brightness-110 shadow-[0_2px_8px_rgba(99,102,241,0.35),inset_0_1px_0.5px_rgba(255,255,255,0.4)] transition-all duration-200 cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5 z-10"
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


