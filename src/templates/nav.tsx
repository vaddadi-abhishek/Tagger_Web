import { useState } from "react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";

interface NavProps {
  onToggle: () => void;
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
}

function Nav({ onToggle, user, onSignOut }: NavProps) {
  const [profileClicked, setProfileClicked] = useState(false);

  return (
    <div className="nav-container sticky top-0 z-30 bg-[var(--code-bg)]">
      <div className="flex justify-between items-center p-5 h-18 bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors duration-300">
        {/* Hamburger Icon */}
        <svg
          onClick={onToggle}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="size-6 text-[var(--text-h)] cursor-pointer hover:opacity-80 transition-opacity md:hidden"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        {/* Profile and Theme Toggle */}
        <div className="flex items-center ml-auto px-6 relative gap-3">
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