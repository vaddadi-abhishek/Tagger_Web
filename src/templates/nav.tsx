import { useState } from "react";
interface NavProps {
  onToggle: () => void;
}
function Nav({ onToggle }: NavProps) {
  const [searchClicked, setSearchClicked] = useState(false);
  const [profileClicked, setProfileClicked] = useState(false);
  return (
    <div className="nav-container">
      <div className="flex justify-between items-center p-5 h-18 bg-[var(--code-bg)] border-b border-[var(--border)]">
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
        {/* Profile and Search Bar */}
        <div className="flex items-center px-6 relative">
          {/* Search Bar Container */}
          <div
            className={`flex items-center rounded-full border border-[var(--border)] transition-colors duration-300 ${
              searchClicked
                ? "bg-[var(--bg)] px-3 py-[0.4rem]"
                : "max-md:bg-transparent max-md:border-none md:bg-[var(--bg)] md:px-3 md:py-[0.4rem]"
            }`}
          >
            <input
              type="text"
              placeholder="Search..."
              className={`outline-none bg-transparent text-[var(--text-h)] placeholder-[var(--text)] transition-all duration-300 ease-in-out ${
                searchClicked
                  ? "w-48 opacity-100 mr-2"
                  : "w-0 opacity-0 p-0 md:w-48 md:opacity-100 md:mr-2"
              }`}
            />
            <div
              onClick={() => setSearchClicked((prev) => !prev)}
              className="flex items-center justify-center cursor-pointer shrink-0 text-[var(--text-h)]"
            >
              {searchClicked && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.0"
                  stroke="currentColor"
                  className="size-6 md:hidden"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className={`size-6 ${
                  searchClicked ? "hidden md:block" : "block"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          </div>
          {/* Profile Dropdown */}
          <div className="ml-8 relative">
            <div
              onClick={() => setProfileClicked((prev) => !prev)}
              className="w-10 h-10 bg-[var(--accent)] text-white rounded-full flex items-center justify-center cursor-pointer"
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