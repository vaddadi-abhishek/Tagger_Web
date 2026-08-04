import { useState } from "react";

interface RedditBookmark {
  id: string;
  title: string;
  subreddit: string;
  source: string;
  author: string;
  createdAt: string;
  dateStr: string;
  score: number;
  numComments: number;
  permalink: string;
  url?: string;
  thumbnail: string;
  postType: "link" | "image" | "text";
  selftext?: string;
  tags: string[];
}

const MOCK_BOOKMARKS: RedditBookmark[] = [
  {
    id: "1",
    title: "A quiet corner of the internet",
    subreddit: "r/webdev",
    source: "Pinterest",
    author: "u/quiet_explorer",
    createdAt: "2 hours ago",
    dateStr: "Jul 7",
    score: 1420,
    numComments: 184,
    permalink: "https://reddit.com",
    url: "https://pinterest.com",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    postType: "image",
    selftext: "The web still has beautiful, weird places if you know where to look.",
    tags: ["Weekend Watch", "productivity"],
  },
  {
    id: "2",
    title: "Tailwind CSS v4.0 is officially released with a brand new engine!",
    subreddit: "r/reactjs",
    source: "Reddit",
    author: "u/frontend_dev",
    createdAt: "5 hours ago",
    dateStr: "Aug 2",
    score: 856,
    numComments: 312,
    permalink: "https://reddit.com",
    url: "https://tailwindcss.com",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    postType: "image",
    selftext: "Discover how the zero-config engine speeds up build times by over 10x with native CSS variables.",
    tags: ["Release", "css"],
  },
  {
    id: "3",
    title: "Building real-time layout engines with WebAssembly and Rust",
    subreddit: "r/programming",
    source: "GitHub",
    author: "u/rustacean",
    createdAt: "1 day ago",
    dateStr: "Aug 1",
    score: 2310,
    numComments: 95,
    permalink: "https://reddit.com",
    url: "https://github.com",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    postType: "link",
    selftext: "An in-depth guide on compiling Rust layout calculators into high-performance WASM binaries.",
    tags: ["Architecture", "rust"],
  },
  {
    id: "4",
    title: "Minimalist UI Architecture for Modern Web Applications",
    subreddit: "r/design",
    source: "Dribbble",
    author: "u/ui_craft",
    createdAt: "2 days ago",
    dateStr: "Jul 28",
    score: 1140,
    numComments: 67,
    permalink: "https://reddit.com",
    url: "https://dribbble.com",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    postType: "image",
    selftext: "Exploring micro-interactions, dark mode color harmonies, and accessible typography scale.",
    tags: ["UI/UX", "design"],
  },
  {
    id: "5",
    title: "Mastering React 19 Server Components and Suspense",
    subreddit: "r/reactjs",
    source: "Medium",
    author: "u/react_master",
    createdAt: "4 days ago",
    dateStr: "Jul 24",
    score: 1980,
    numComments: 142,
    permalink: "https://reddit.com",
    url: "https://medium.com",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
    postType: "text",
    selftext: "Practical patterns for streaming SSR and client state synchronization without hydration mismatches.",
    tags: ["React", "frontend"],
  },
  {
    id: "6",
    title: "Designing Calm Interfaces in a Hyper-Connected World",
    subreddit: "r/webdesign",
    source: "Substack",
    author: "u/mindful_tech",
    createdAt: "1 week ago",
    dateStr: "Jul 15",
    score: 740,
    numComments: 38,
    permalink: "https://reddit.com",
    url: "https://substack.com",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    postType: "image",
    selftext: "Why distraction-free layouts and soft color palettes improve user focus and cognitive retention.",
    tags: ["Productivity", "calm"],
  },
];

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<RedditBookmark[]>(MOCK_BOOKMARKS);
  const [filter, setFilter] = useState<"all" | "images" | "articles">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const cleanSearch = searchTerm.toLowerCase().replace(/^#/, "");

  const filteredBookmarks = bookmarks.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(cleanSearch) ||
      item.subreddit.toLowerCase().includes(cleanSearch) ||
      item.tags.some((t) => t.toLowerCase().replace(/^#/, "").includes(cleanSearch));

    if (filter === "images") return matchesSearch && item.postType === "image";
    if (filter === "articles") return matchesSearch && item.postType !== "image";
    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Invisible backdrop to dismiss open dropdown menus */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Header & Controls Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">
            Saved Bookmarks
          </h1>
          <p className="text-sm text-[var(--text)]">
            Saved posts synced with your account
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Filter saved items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
          />

          <div className="flex bg-[var(--code-bg)] border border-[var(--border)] p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${filter === "all"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("images")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${filter === "images"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
                }`}
            >
              Media
            </button>
            <button
              onClick={() => setFilter("articles")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${filter === "articles"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
                }`}
            >
              Text
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarks Responsive 3-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookmarks.map((bookmark) => {
          return (
            <div
              key={bookmark.id}
              className="group relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow)] hover:border-[var(--accent-border)] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Media Image Section */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[var(--bg)]">
                <img
                  src={bookmark.thumbnail}
                  alt={bookmark.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Right Source Badge */}
                <div className="absolute top-3 right-3 rounded-full px-3 py-1 bg-black/60 backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5 shadow-md">
                  <span className="size-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                  <span>{bookmark.source}</span>
                </div>
              </div>

              {/* Card Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <a
                    href={bookmark.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-[var(--text-h)] hover:text-[var(--primary)] transition-colors leading-snug block line-clamp-2"
                  >
                    {bookmark.title}
                  </a>

                  {bookmark.selftext && (
                    <p className="text-xs text-[var(--text)] line-clamp-2 leading-relaxed opacity-90">
                      {bookmark.selftext}
                    </p>
                  )}
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {bookmark.tags.map((tag, idx) => {
                    const cleanTag = tag.replace(/^#/, "");
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent-bg)] text-[var(--primary)] border border-[var(--accent-border)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer group/tag"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="size-3.5 shrink-0 transition-transform group-hover/tag:scale-110"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6h.008v.008H6V6z"
                          />
                        </svg>
                        <span>{cleanTag}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text)]">
                <span>{bookmark.dateStr}</span>

                <div className="flex items-center gap-2">
                  {bookmark.url && (
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Open Source Link"
                      className="p-1.5 rounded-lg hover:bg-[var(--bg)] hover:text-[var(--primary)] transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  )}

                  {/* 3-Dots Options Menu Dropdown Container */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) =>
                          prev === bookmark.id ? null : bookmark.id
                        );
                      }}
                      title="More options"
                      className="p-1.5 rounded-lg hover:bg-[var(--bg)] hover:text-[var(--text-h)] transition-colors cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="size-4 pointer-events-none"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                        />
                      </svg>
                    </button>

                    {openMenuId === bookmark.id && (
                      <div className="absolute right-0 bottom-8 w-48 bg-[var(--code-bg)] border border-[var(--border)] rounded-xl shadow-xl p-1.5 z-30 text-xs font-medium text-[var(--text-h)]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer flex items-center gap-2.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="size-4 shrink-0 text-[var(--primary)] pointer-events-none"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                          <span className="pointer-events-none">Edit bookmark</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer flex items-center gap-2.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="size-4 shrink-0 text-[var(--primary)] pointer-events-none"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                            />
                          </svg>
                          <span className="pointer-events-none">Manage Collections</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer flex items-center gap-2.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="size-4 shrink-0 text-[var(--primary)] pointer-events-none"
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
                          <span className="pointer-events-none">Edit Tags</span>
                        </button>
                        <hr className="my-1 border-[var(--border)]" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(bookmark.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer font-semibold flex items-center gap-2.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="size-4 shrink-0 pointer-events-none"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          <span className="pointer-events-none">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredBookmarks.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text)] border border-dashed border-[var(--border)] rounded-2xl">
            No bookmarks found matching your search criteria.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--text-h)]">
                Delete Bookmark?
              </h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                Are you sure you want to delete this bookmark? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(null);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(deleteConfirmId);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-md transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}