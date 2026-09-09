import { useState, useEffect, useRef } from "react";
import { Glass } from "@samasante/liquid-glass";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";

interface NavProps {
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  isScrolled?: boolean;
}

function Nav({
  user,
  onSignOut,
  searchTerm = "",
  onSearchChange,
  isScrolled: externalIsScrolled,
}: NavProps) {
  const [profileClicked, setProfileClicked] = useState(false);
  const [notificationsClicked, setNotificationsClicked] = useState(false);
  const [internalIsScrolled, setInternalIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Use external isScrolled prop if provided, otherwise detect window scroll
  const isScrolled = externalIsScrolled !== undefined ? externalIsScrolled : internalIsScrolled;

  useEffect(() => {
    if (externalIsScrolled !== undefined) return;

    const handleScroll = () => {
      setInternalIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [externalIsScrolled]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileClicked(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsClicked(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full transition-all duration-300">
      <Glass
        className={`w-full transition-all duration-300 ${isScrolled ? "shadow-[0_10px_30px_rgba(0,0,0,0.12)]" : ""
          }`}
        style={{
          display: "block",
        }}
        optics={{
          mapSize: 256,
          clipToShape: true,
          softEdge: true,
          depth: isScrolled ? 0.95 : 0,
          curvature: isScrolled ? 0.48 : 0,
          dispersion: isScrolled ? 0.65 : 0,
          strength: isScrolled ? 0.2 : 0,
          bend: isScrolled ? 0.72 : 0,
          bendWidth: isScrolled ? 0.12 : 0,
          frost: isScrolled ? 2 : 0,
          brightness: 0,
          specular: isScrolled ? 1.4 : 0,
          sheenAngle: 50,
          sheen: isScrolled ? 1.3 : 0,
          sheenWidth: isScrolled ? 3.5 : 0,
          glow: isScrolled ? 0.25 : 0,
        }}
      >
        <div className="w-full flex items-center justify-between px-4 sm:px-8 h-20 gap-4 sm:gap-6">
          {/* Searchbar stretching all the way to top-right icons */}
          <div className="flex-1 min-w-0">
            <div className="relative flex items-center border-b border-black/20 dark:border-white/25 focus-within:border-black/70 dark:focus-within:border-white/80 transition-all duration-300 pb-1.5 group w-full">
              <input
                type="text"
                id="top-search-mind"
                placeholder="Search my mind..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="search-mind-input w-full bg-transparent outline-none text-lg sm:text-xl md:text-2xl text-[var(--text-h)] placeholder-zinc-400/70 dark:placeholder-zinc-500/70 transition-colors pr-7"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  aria-label="Clear search"
                  className="absolute right-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-1 text-sm font-sans transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Section: Only Theme Toggle, Notifications, Profile Icon */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* 1. Light/Dark Mode Switch */}
            <div className="relative">
              <AnimatedThemeToggler
                variant="circle"
                duration={500}
                className="size-9 sm:size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all"
              />
            </div>

            {/* 2. Notifications Bell Icon */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsClicked((prev) => !prev);
                  setProfileClicked(false);
                }}
                aria-label="View notifications"
                className="relative size-9 sm:size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all text-[var(--text-h)] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="size-4.5 sm:size-5 text-[var(--text-h)] group-hover:scale-105 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                {/* Unread indicator dot */}
                <span className="absolute top-2 right-2 size-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-zinc-900" />
              </button>

              {/* Notifications Liquid Glass Flyout Panel */}
              {notificationsClicked && (
                <Glass
                  className="absolute right-0 mt-3 w-80 rounded-3xl p-4 z-40 text-xs bg-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  style={{ display: "block" }}
                  optics={{
                    mapSize: 256,
                    clipToShape: true,
                    softEdge: true,
                    depth: 0.95,
                    curvature: 0.52,
                    dispersion: 0.65,
                    strength: 0.22,
                    bend: 0.75,
                    bendWidth: 0.12,
                    frost: 0.2,
                    brightness: 0,
                    specular: 1.95,
                    sheenAngle: 50,
                    sheen: 1.3,
                    sheenWidth: 3.5,
                    glow: 0.25,
                  }}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-500/20 mb-2.5">
                    <span className="font-bold text-sm text-[var(--text-h)]">Notifications</span>
                    <span className="text-[10px] uppercase font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-2.5 rounded-2xl space-y-1">
                      <p className="font-semibold text-[var(--text-h)]">Bookmarks in Sync</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Your saved bookmarks and metadata are synced with cloud storage.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl space-y-1">
                      <p className="font-semibold text-[var(--text-h)]">Auto Scraper Online</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Smart metadata scraper is active and extracting rich social cards.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-zinc-500/20 text-center">
                    <button
                      type="button"
                      onClick={() => setNotificationsClicked(false)}
                      className="text-[11px] font-semibold text-sky-500 hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </Glass>
              )}
            </div>

            {/* 3. Profile Avatar Icon */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileClicked((prev) => !prev);
                  setNotificationsClicked(false);
                }}
                className="size-9 sm:size-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-sky-400/40 transition-all overflow-hidden"
                title={user?.name || "User Profile"}
              >
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.0}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                )}
              </button>

              {/* Profile Menu Dropdown */}
              {profileClicked && (
                <Glass
                  className="absolute right-0 mt-3 w-56 rounded-3xl p-2.5 z-40 text-xs shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-[var(--text)]"
                  style={{ display: "block" }}
                  optics={{
                    mapSize: 256,
                    clipToShape: true,
                    softEdge: true,
                    depth: 0.95,
                    curvature: 0.5,
                    dispersion: 0.6,
                    strength: 0.2,
                    bend: 0.7,
                    bendWidth: 0.12,
                    frost: 2.5,
                    brightness: 0,
                    specular: 1.4,
                    sheenAngle: 50,
                    sheen: 1.25,
                    sheenWidth: 3.5,
                    glow: 0.25,
                  }}
                >
                  {user && (
                    <div className="px-3 py-2 border-b border-zinc-500/20 mb-1">
                      <p className="font-bold text-[var(--text-h)] truncate">{user.name}</p>
                      <p className="text-[11px] opacity-70 truncate">{user.email}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setProfileClicked(false)}
                    className="w-full text-left block px-3 py-2 hover:bg-white/10 hover:text-[var(--text-h)] rounded-2xl transition-colors cursor-pointer"
                  >
                    Your Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileClicked(false)}
                    className="w-full text-left block px-3 py-2 hover:bg-white/10 hover:text-[var(--text-h)] rounded-2xl transition-colors cursor-pointer"
                  >
                    Settings
                  </button>
                  <hr className="my-1 border-zinc-500/20" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileClicked(false);
                      onSignOut?.();
                    }}
                    className="w-full text-left block px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-2xl transition-colors cursor-pointer font-bold"
                  >
                    Sign Out
                  </button>
                </Glass>
              )}
            </div>
          </div>
        </div>
      </Glass>
    </header>
  );
}

export default Nav;