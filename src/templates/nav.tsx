import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Glass } from "@samasante/liquid-glass";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";

interface NavProps {
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  isScrolled?: boolean;
}

interface DropdownPosition {
  top: number;
  right: number;
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
  const [notifPos, setNotifPos] = useState<DropdownPosition>({ top: 0, right: 0 });
  const [profilePos, setProfilePos] = useState<DropdownPosition>({ top: 0, right: 0 });
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInputFocusedRef = useRef(false);

  // Use external isScrolled prop if provided, otherwise detect window scroll
  const isScrolled = externalIsScrolled !== undefined ? externalIsScrolled : internalIsScrolled;

  // Preserve focus if scrolling while search input is active
  useEffect(() => {
    if (isInputFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isScrolled]);

  // Calculate dropdown position from trigger button
  const updateNotifPos = useCallback(() => {
    if (notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifPos({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  const updateProfilePos = useCallback(() => {
    if (profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      setProfilePos({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (externalIsScrolled !== undefined) return;

    const handleScroll = () => {
      setInternalIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [externalIsScrolled]);

  // Recalculate dropdown positions on scroll/resize
  useEffect(() => {
    const handleReposition = () => {
      if (notificationsClicked) updateNotifPos();
      if (profileClicked) updateProfilePos();
    };

    window.addEventListener("scroll", handleReposition, { passive: true });
    window.addEventListener("resize", handleReposition, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
    };
  }, [notificationsClicked, profileClicked, updateNotifPos, updateProfilePos]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        profileRef.current &&
        !profileRef.current.contains(target) &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setProfileClicked(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(target)
      ) {
        setNotificationsClicked(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navContent = (
    <div className="w-full flex items-center justify-between px-4 sm:px-8 h-20 gap-4 sm:gap-6">
      {/* Searchbar stretching all the way to top-right icons */}
      <div className="flex-1 min-w-0">
        <div className="relative flex items-center border-b border-[#B5814C]/30 dark:border-[#C88E3E]/30 focus-within:border-[#B5814C] dark:focus-within:border-[#C88E3E] transition-all duration-300 pb-1.5 group w-full">
          <input
            ref={searchInputRef}
            type="text"
            id="top-search-mind"
            placeholder="Search your mind..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={() => {
              isInputFocusedRef.current = true;
            }}
            onBlur={() => {
              isInputFocusedRef.current = false;
            }}
            className="search-mind-input w-full bg-transparent outline-none text-lg sm:text-xl md:text-2xl text-[var(--text-h)] placeholder-[#8C8377]/70 dark:placeholder-[#7E7569]/70 transition-colors pr-7"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
              className="absolute right-0 text-[#8C8377] hover:text-[var(--text-h)] cursor-pointer p-1 text-sm font-sans transition-colors"
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
            className="size-9 sm:size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all text-[var(--text-h)]"
          />
        </div>

        {/* 2. Notifications Bell Icon */}
        <div className="relative" ref={notificationsRef}>
          <button
            ref={notifBtnRef}
            type="button"
            onClick={() => {
              if (!notificationsClicked) updateNotifPos();
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
            {/* Unread indicator dot (Sand Dune Amber) */}
            <span className="absolute top-2 right-2 size-2 rounded-full bg-[#D99F50] ring-2 ring-[#FAF8F5] dark:ring-[#0B0907]" />
          </button>
        </div>

        {/* 3. Profile Avatar Icon (Signature Sand Dune Gradient) */}
        <div className="relative" ref={profileRef}>
          <button
            ref={profileBtnRef}
            type="button"
            onClick={() => {
              if (!profileClicked) updateProfilePos();
              setProfileClicked((prev) => !prev);
              setNotificationsClicked(false);
            }}
            className="size-9 sm:size-10 rounded-full bg-gradient-to-tr from-[#B5814C] to-[#996533] hover:from-[#C08C56] hover:to-[#A4703D] text-white font-bold text-xs sm:text-sm flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(168,110,50,0.25)] hover:ring-2 hover:ring-[#B5814C]/40 transition-all overflow-hidden"
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
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 w-full transition-all duration-300">
        {isScrolled ? (
          <Glass
            className="w-full transition-all duration-300 border-b border-[#EBE5DC]/80 dark:border-[#26211C]/80 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            style={{
              display: "block",
            }}
            optics={{
              mapSize: 256,
              clipToShape: true,
              softEdge: true,
              depth: 0.95,
              curvature: 0.48,
              dispersion: 0.65,
              strength: 0.05,
              bend: 0.72,
              bendWidth: 0.12,
              frost: 2,
              brightness: 0,
              specular: 1.4,
              sheenAngle: 50,
              sheen: 0.4,
              sheenWidth: 2.5,
              glow: 0.1,
            }}
          >
            {navContent}
          </Glass>
        ) : (
          <div className="w-full transition-all duration-300 bg-transparent border-b border-transparent">
            {navContent}
          </div>
        )}
      </header>

      {/* Portaled Notifications Dropdown — rendered outside navbar with clean Sand Dune styling */}
      {notificationsClicked &&
        createPortal(
          <div
            ref={notifDropdownRef}
            className="fixed z-50"
            style={{ top: notifPos.top, right: notifPos.right }}
          >
            <div
              className="w-80 rounded-3xl p-4 text-xs shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#FAF8F5] dark:bg-[#14110E] border border-[#B5814C]/25 dark:border-[#C88E3E]/25 transition-all"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#EBE5DC] dark:border-[#26211C] mb-2.5">
                <span className="font-bold text-sm text-[var(--text-h)]">Notifications</span>
                <span className="text-[10px] uppercase font-bold text-[#B5814C] dark:text-[#D99F50] bg-[#B5814C]/10 dark:bg-[#D99F50]/15 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2.5 rounded-2xl space-y-1">
                  <p className="font-semibold text-[var(--text-h)]">Bookmarks in Sync</p>
                  <p className="text-[11px] text-[#5F5850] dark:text-[#A89F91]">
                    Your saved bookmarks and metadata are synced with cloud storage.
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl space-y-1">
                  <p className="font-semibold text-[var(--text-h)]">Auto Scraper Online</p>
                  <p className="text-[11px] text-[#5F5850] dark:text-[#A89F91]">
                    Smart metadata scraper is active and extracting rich social cards.
                  </p>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-[#EBE5DC] dark:border-[#26211C] text-center">
                <button
                  type="button"
                  onClick={() => setNotificationsClicked(false)}
                  className="text-[11px] font-semibold text-[#B5814C] dark:text-[#D99F50] hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Portaled Profile Dropdown — rendered outside navbar with clean Sand Dune styling */}
      {profileClicked &&
        createPortal(
          <div
            ref={profileDropdownRef}
            className="fixed z-50"
            style={{ top: profilePos.top, right: profilePos.right }}
          >
            <div
              className="w-56 rounded-3xl p-2.5 text-xs shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#FAF8F5] dark:bg-[#14110E] border border-[#B5814C]/25 dark:border-[#C88E3E]/25 text-[var(--text)] transition-all"
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
                className="w-full text-left block px-3 py-2 hover:bg-[#B5814C]/10 dark:hover:bg-white/10 hover:text-[var(--text-h)] rounded-2xl transition-colors cursor-pointer"
              >
                Your Profile
              </button>
              <button
                type="button"
                onClick={() => setProfileClicked(false)}
                className="w-full text-left block px-3 py-2 hover:bg-[#B5814C]/10 dark:hover:bg-white/10 hover:text-[var(--text-h)] rounded-2xl transition-colors cursor-pointer"
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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Nav;