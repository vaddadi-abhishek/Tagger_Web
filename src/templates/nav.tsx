import { useState, useEffect } from "react";

interface NavProps {
  onToggle: () => void;
}

function Nav({ onToggle }: NavProps) {
  const [profileClicked, setProfileClicked] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="nav-container">
      <div className="flex justify-between items-center p-5 h-18 bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors duration-300">
        {/* Hamburger Icon */}
        <svg
          onClick={onToggle}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="size-6 text-[var(--text-h)] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        {/* Profile and Theme Toggle */}
        <div className="flex items-center px-6 relative gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-full text-[var(--text-h)] bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] transition-all cursor-pointer flex items-center justify-center"
          >
            {isDark ? (
              /* Sun Icon for Light Mode */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-5 text-[var(--accent)]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.356-6.364l-1.591 1.591M6.758 17.242l-1.591 1.591m12.728 0l-1.591-1.591M6.758 6.758L5.167 5.167M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
                />
              </svg>
            ) : (
              /* Moon Icon for Dark Mode */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-5 text-[var(--primary)]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setProfileClicked((prev) => !prev)}
              className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent)] transition-colors shadow-sm"
            >
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
            </div>
            {profileClicked && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-[var(--shadow)] p-1 z-10 text-[var(--text)]">
                <a
                  href="#profile"
                  className="block text-sm px-4 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] rounded transition-colors"
                >
                  Your Profile
                </a>
                <hr className="my-1 border-[var(--border)]" />
                <a
                  href="#settings"
                  className="block text-sm px-4 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] rounded transition-colors"
                >
                  Settings
                </a>
                <hr className="my-1 border-[var(--border)]" />
                <a
                  href="#logout"
                  className="block text-sm px-4 py-2 hover:bg-[var(--accent-bg)] text-red-500 rounded transition-colors"
                >
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nav;