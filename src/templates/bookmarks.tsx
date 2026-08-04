import { useState } from "react";

// Mock Bookmark Type based on Reddit API response structure
interface RedditBookmark {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  createdAt: string;
  score: number;
  numComments: number;
  permalink: string;
  url?: string;
  thumbnail?: string;
  postType: "link" | "image" | "text";
  selftext?: string;
  isReadLater?: boolean;
}

const MOCK_BOOKMARKS: RedditBookmark[] = [
  {
    id: "1",
    title: "Tailwind CSS v4.0 is officially released with a brand new engine!",
    subreddit: "r/reactjs",
    author: "u/frontend_dev",
    createdAt: "2 hours ago",
    score: 1420,
    numComments: 184,
    permalink: "https://reddit.com",
    url: "https://tailwindcss.com",
    thumbnail: "https://picsum.photos/seed/tailwind/400/250",
    postType: "image",
  },
  {
    id: "2",
    title: "What is your favorite design pattern when building large React architecture?",
    subreddit: "r/webdev",
    author: "u/code_architect",
    createdAt: "5 hours ago",
    score: 856,
    numComments: 312,
    permalink: "https://reddit.com",
    postType: "text",
    selftext:
      "I've been working with feature-based folder structures recently and noticed a huge boost in developer velocity across large teams...",
  },
  {
    id: "3",
    title: "Building real-time layout engines with WebAssembly and Rust",
    subreddit: "r/programming",
    author: "u/rustacean",
    createdAt: "1 day ago",
    score: 2310,
    numComments: 95,
    permalink: "https://reddit.com",
    url: "https://github.com",
    postType: "link",
  },
];

export default function BookmarksScreen() {
  const [filter, setFilter] = useState<"all" | "images" | "articles">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookmarks = MOCK_BOOKMARKS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subreddit.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "images") return matchesSearch && item.postType === "image";
    if (filter === "articles") return matchesSearch && item.postType !== "image";
    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Controls Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">
            Saved Bookmarks
          </h1>
          <p className="text-sm text-[var(--text)]">
            Saved posts synced with your Reddit account
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter saved items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          />

          <div className="flex bg-[var(--code-bg)] border border-[var(--border)] p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === "all"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("images")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === "images"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setFilter("articles")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === "articles"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              Text
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group relative bg-[var(--code-bg)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow)] hover:border-[var(--accent-border)] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Meta Row: Subreddit, Author, Posted Time */}
              <div className="flex items-center justify-between text-xs text-[var(--text)] mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--accent)] bg-[var(--accent-bg)] px-2 py-0.5 rounded-md">
                    {bookmark.subreddit}
                  </span>
                  <span>•</span>
                  <span>{bookmark.author}</span>
                  <span>•</span>
                  <span>{bookmark.createdAt}</span>
                </div>

                {/* Bookmark Remove / Option Actions */}
                <button
                  title="Remove Bookmark"
                  className="p-1 rounded-md text-[var(--text)] hover:text-red-500 hover:bg-[var(--bg)] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                </button>
              </div>

              {/* Title & Preview Content Layout */}
              <div className="flex flex-col md:flex-row gap-4 justify-between my-2">
                <div className="flex-1 space-y-2">
                  <a
                    href={bookmark.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-bold text-[var(--text-h)] hover:text-[var(--accent)] transition-colors leading-snug block"
                  >
                    {bookmark.title}
                  </a>

                  {/* Optional Body Snippet for Text Posts */}
                  {bookmark.selftext && (
                    <p className="text-sm text-[var(--text)] line-clamp-2">
                      {bookmark.selftext}
                    </p>
                  )}
                </div>

                {/* Optional Media Thumbnail */}
                {bookmark.thumbnail && (
                  <div className="w-full md:w-36 h-24 rounded-lg overflow-hidden shrink-0 border border-[var(--border)] bg-[var(--bg)]">
                    <img
                      src={bookmark.thumbnail}
                      alt={bookmark.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Row: Karma/Score, Comments, External Link */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border)] text-xs text-[var(--text)]">
              <div className="flex items-center gap-4">
                {/* Score */}
                <div className="flex items-center gap-1 font-medium text-[var(--text-h)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-4 text-[var(--accent)]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                    />
                  </svg>
                  <span>{bookmark.score.toLocaleString()}</span>
                </div>

                {/* Comments count */}
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.51-.358 1.137-.52 1.755-.52Z"
                    />
                  </svg>
                  <span>{bookmark.numComments} comments</span>
                </div>
              </div>

              {/* External Target Link */}
              {bookmark.url && (
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                >
                  <span>Source URL</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-12 text-[var(--text)] border border-dashed border-[var(--border)] rounded-xl">
            No bookmarks found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}