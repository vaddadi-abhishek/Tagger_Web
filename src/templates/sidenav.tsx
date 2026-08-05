import { useState } from "react";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";
import { INITIAL_COLLECTIONS } from "../dummy_data/collectionsData";
import { INITIAL_TAGS } from "../dummy_data/tagsData";

export interface SideNavProps {
  isSideNavOpen: boolean;
  onClose?: () => void;
  activeScreen?: "home" | "collections" | "tags";
  onSelectScreen?: (screen: "home" | "collections" | "tags") => void;
  collections?: CollectionItem[];
  tags?: TagItem[];
  onSelectCollectionFilter?: (colName: string) => void;
  onSelectTagFilter?: (tagName: string) => void;
}

function SideNav({
  isSideNavOpen,
  onClose,
  activeScreen = "home",
  onSelectScreen,
  collections: externalCollections,
  tags: externalTags,
  onSelectCollectionFilter,
  onSelectTagFilter,
}: SideNavProps) {
  const [navSearch, setNavSearch] = useState("");
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);

  const collections = externalCollections || INITIAL_COLLECTIONS;
  const tags = externalTags || INITIAL_TAGS;

  const cleanNavSearch = navSearch.toLowerCase().trim();

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(cleanNavSearch)
  );

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(cleanNavSearch)
  );

  const handleNavClick = (screen: "home" | "collections" | "tags") => {
    if (onSelectScreen) {
      onSelectScreen(screen);
    }
    onClose?.();
  };

  const handleCollectionItemClick = (colName: string) => {
    if (onSelectCollectionFilter) {
      onSelectCollectionFilter(colName);
    } else {
      handleNavClick("home");
    }
    onClose?.();
  };

  const handleTagItemClick = (tagName: string) => {
    if (onSelectTagFilter) {
      onSelectTagFilter(tagName);
    } else {
      handleNavClick("home");
    }
    onClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSideNavOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* SideNav Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen h-[100dvh] w-64 bg-[var(--code-bg)] border-r border-[var(--border)] flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 shrink-0 ${
          isSideNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 1. FIXED TOP SECTION */}
        <div className="p-4 space-y-4 shrink-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg shadow-md">
                T
              </div>
              <span className="font-bold text-lg text-[var(--text-h)] tracking-tight">
                Tagger
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search Input Bar (Filters Navbar Items) */}
          <div className="relative flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text)] pointer-events-none opacity-70 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-base md:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors truncate placeholder:truncate leading-normal"
            />
          </div>

          {/* Primary Main Menu Links */}
          <nav className="space-y-1">
            {/* Home Link */}
            <button
              onClick={() => handleNavClick("home")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-colors group cursor-pointer ${
                activeScreen === "home"
                  ? "bg-[var(--accent-bg)] text-[var(--primary)] shadow-xs"
                  : "text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4 shrink-0 transition-transform group-hover:scale-110"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span>Home</span>
            </button>

            {/* Collections Link */}
            <button
              onClick={() => handleNavClick("collections")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-colors group cursor-pointer ${
                activeScreen === "collections"
                  ? "bg-[var(--accent-bg)] text-[var(--primary)] shadow-xs"
                  : "text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4 shrink-0 transition-transform group-hover:scale-110"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                />
              </svg>
              <span>Collections</span>
            </button>

            {/* Tags Link */}
            <button
              onClick={() => handleNavClick("tags")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-colors group cursor-pointer ${
                activeScreen === "tags"
                  ? "bg-[var(--accent-bg)] text-[var(--primary)] shadow-xs"
                  : "text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4 shrink-0 transition-transform group-hover:scale-110"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6Z"
                />
              </svg>
              <span>Tags</span>
            </button>
          </nav>
        </div>

        <hr className="border-[var(--border)] shrink-0" />

        {/* 2. SCROLLABLE MIDDLE SECTION */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Collapsible Collections Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsCollectionsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-[11px] font-bold tracking-wider text-[var(--text)] uppercase hover:text-[var(--text-h)] py-1 cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className={`size-3 transition-transform duration-200 ${
                    isCollectionsOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
                <span>COLLECTIONS</span>
              </div>
            </button>

            {isCollectionsOpen && (
              <div className="space-y-0.5 pt-1 pl-2">
                {filteredCollections.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => handleCollectionItemClick(col.name)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] rounded-lg transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Multi-color folder icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="size-4 shrink-0 transition-transform group-hover:scale-110"
                        style={{ color: col.color }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                        />
                      </svg>
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[11px] opacity-60 font-mono font-medium">
                      {col.count}
                    </span>
                  </button>
                ))}

                {filteredCollections.length === 0 && (
                  <div className="text-[11px] text-[var(--text)] opacity-60 py-1 px-2 italic">
                    No collections found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapsible Tags Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsTagsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-[11px] font-bold tracking-wider text-[var(--text)] uppercase hover:text-[var(--text-h)] py-1 cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className={`size-3 transition-transform duration-200 ${
                    isTagsOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
                <span>TAGS</span>
              </div>
            </button>

            {isTagsOpen && (
              <div className="space-y-0.5 pt-1 pl-2">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagItemClick(tag.name)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] rounded-lg transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Multi-color tag dot icon */}
                      <span
                        className="size-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    <span className="text-[11px] opacity-60 font-mono font-medium">
                      {tag.count}
                    </span>
                  </button>
                ))}

                {filteredTags.length === 0 && (
                  <div className="text-[11px] text-[var(--text)] opacity-60 py-1 px-2 italic">
                    No tags found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <hr className="border-[var(--border)] shrink-0" />

        {/* 3. FIXED BOTTOM SECTION */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => handleNavClick("home")}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] transition-colors group cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-4 shrink-0 transition-transform group-hover:scale-110"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default SideNav;