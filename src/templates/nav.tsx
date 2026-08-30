import { useState } from "react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";

interface NavProps {
  onToggle: () => void;
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
  activeScreen?: "home" | "collections" | "tags";
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

function Nav({
  onToggle,
  user,
  onSignOut,
  activeScreen = "home",
  searchTerm = "",
  onSearchChange,
}: NavProps) {
  const [profileClicked, setProfileClicked] = useState(false);

  let titleText = "Saved Bookmarks";
  let subtitleText = "Saved posts synced with your account";

  if (activeScreen === "collections") {
    titleText = "Collections";
    subtitleText = "Group related bookmarks into folders";
  } else if (activeScreen === "tags") {
    titleText = "Tags";
    subtitleText = "Cross-cut your bookmarks with labels";
  }

  return (
    <div className="nav-container sticky top-0 z-30 bg-[var(--code-bg)]">
      <div className="flex justify-between items-center px-4 sm:px-6 h-20 bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors duration-300 gap-4">
        {/* Hamburger Icon & Navbar Header Title/Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <svg
            onClick={onToggle}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="size-6 text-[var(--text-h)] cursor-pointer hover:opacity-80 transition-opacity md:hidden shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-h)] truncate">
              {titleText}
            </h1>
            <p className="text-xs text-[var(--text)] opacity-80 hidden sm:block truncate">
              {subtitleText}
            </p>
          </div>
        </div>

        {/* Right Section: Search Bar + Theme Toggle + Profile Dropdown */}
        <div className="flex items-center ml-auto relative gap-3 shrink-0">
          {/* Search Input Bar (in Top Navbar) */}
          {activeScreen === "home" && onSearchChange && (
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search bookmarks"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-36 sm:w-64 px-3.5 py-1.5 pr-8 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors leading-normal"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 text-[var(--text)] hover:text-red-500 cursor-pointer p-0.5 text-xs font-bold"
                  title="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Magic UI Animated Circular Theme Toggler Component */}
          <AnimatedThemeToggler variant="circle" duration={500} />

          {/* Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setProfileClicked((prev) => !prev)}
              className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent)] transition-colors shadow-sm font-bold text-sm"
              title={user?.name || "User Profile"}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.0}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              )}
            </div>
            {profileClicked && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-2 z-40 text-[var(--text)] text-xs">
                {user && (
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                    <p className="font-bold text-[var(--text-h)] truncate">{user.name}</p>
                    <p className="text-[11px] opacity-70 truncate">{user.email}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setProfileClicked(false)}
                  className="w-full text-left block px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] rounded-xl transition-colors cursor-pointer"
                >
                  Your Profile
                </button>
                <button
                  type="button"
                  onClick={() => setProfileClicked(false)}
                  className="w-full text-left block px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] rounded-xl transition-colors cursor-pointer"
                >
                  Settings
                </button>
                <hr className="my-1 border-[var(--border)]" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileClicked(false);
                    onSignOut?.();
                  }}
                  className="w-full text-left block px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors cursor-pointer font-bold"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nav;