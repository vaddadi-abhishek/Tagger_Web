import { useState } from "react";
import { AnimatedThemeToggler } from "./ui/AnimatedThemeToggler";

interface LandingPageProps {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  onNavigateToAuth: (mode: "login" | "signup") => void;
  onOpenApp: () => void;
}

export function LandingPage({
  isLoggedIn,
  user,
  onNavigateToAuth,
  onOpenApp,
}: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"metadata" | "collections" | "tags" | "theme">("metadata");

  return (
    <div className="min-h-screen w-full max-w-full bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 relative overflow-x-hidden selection:bg-[var(--primary)] selection:text-white">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[var(--primary)]/15 via-[var(--accent)]/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-10 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl" />
      </div>

      {/* 1. STICKY HEADER NAVBAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--bg)]/85 border-b border-[var(--border)] transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="size-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-[var(--primary)]/25">
              T
            </div>
            <span className="font-extrabold text-2xl text-[var(--text-h)] tracking-tight">
              Tagger
            </span>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[var(--text)] opacity-80">
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-[var(--primary)] transition-colors">
              Interactive Demo
            </a>
            <a href="#performance" className="hover:text-[var(--primary)] transition-colors">
              Performance
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4">
            <AnimatedThemeToggler variant="circle" duration={500} />

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs font-semibold text-[var(--text)] opacity-80">
                  Hi, {user?.name || "User"}
                </span>
                <button
                  onClick={onOpenApp}
                  className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-[var(--primary)] text-white hover:opacity-95 shadow-xl shadow-[var(--primary)]/20 transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <span>Open App</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="size-4 group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateToAuth("login")}
                  className="px-4 py-2 text-xs font-bold rounded-2xl text-[var(--text-h)] hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigateToAuth("signup")}
                  className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-[var(--primary)] text-white hover:opacity-95 shadow-lg shadow-[var(--primary)]/20 transition-all cursor-pointer"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--code-bg)] border border-[var(--accent-border)] text-[var(--primary)] text-xs font-bold shadow-xs">
          <span className="size-2 rounded-full bg-[var(--primary)] animate-pulse" />
          <span>Next-Gen Bookmark & Knowledge Organizer</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-h)] tracking-tight max-w-5xl mx-auto leading-[1.1]">
          All your bookmarks & inspiration.{" "}
          <span className="bg-gradient-to-r from-[var(--primary)] via-blue-500 to-[var(--secondary)] bg-clip-text text-transparent">
            Organised effortlessly.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-[var(--text)] max-w-2xl mx-auto leading-relaxed opacity-90 font-normal">
          Tagger brings all your web links, research notes, tags, and collections into one fast, intelligent, and beautifully structured workspace.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isLoggedIn ? (
            <button
              onClick={onOpenApp}
              className="px-8 py-4 text-sm font-extrabold rounded-2xl bg-[var(--primary)] text-white hover:opacity-95 shadow-2xl shadow-[var(--primary)]/30 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <span>Open Tagger Workspace</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="size-5 group-hover:translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateToAuth("signup")}
                className="px-8 py-4 text-sm font-extrabold rounded-2xl bg-[var(--primary)] text-white hover:opacity-95 shadow-2xl shadow-[var(--primary)]/30 transition-all cursor-pointer flex items-center gap-3 group"
              >
                <span>Get Started Free</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="size-5 group-hover:translate-x-1 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
              <button
                onClick={() => onNavigateToAuth("login")}
                className="px-8 py-4 text-sm font-bold rounded-2xl bg-[var(--code-bg)] text-[var(--text-h)] border border-[var(--border)] hover:bg-[var(--accent-bg)] transition-all cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Product Interactive Dashboard Mockup Preview */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="relative rounded-3xl p-3 sm:p-5 bg-[var(--code-bg)] border border-[var(--border)] shadow-2xl overflow-hidden group">
            {/* Top Mockup Browser Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
              </div>
              <div className="px-4 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--text)] font-mono opacity-80 max-w-xs truncate">
                https://tagger.app/workspace
              </div>
              <div className="size-4" />
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              {/* Sidebar Mockup */}
              <div className="hidden md:block p-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center">T</div>
                  <span className="font-bold text-xs text-[var(--text-h)]">Tagger</span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="p-2 rounded-xl bg-[var(--accent-bg)] text-[var(--primary)] text-xs font-semibold flex items-center gap-2">
                    <span>🏠</span> Home
                  </div>
                  <div className="p-2 rounded-xl text-xs font-medium text-[var(--text)] opacity-70 flex items-center gap-2">
                    <span>📁</span> Reading List
                  </div>
                  <div className="p-2 rounded-xl text-xs font-medium text-[var(--text)] opacity-70 flex items-center gap-2">
                    <span>⚡</span> Tech Stack
                  </div>
                </div>
              </div>

              {/* Cards Grid Mockup */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                  <div className="h-28 w-full bg-gradient-to-tr from-blue-500/20 to-teal-400/20 rounded-xl flex items-center justify-center font-bold text-xs text-[var(--primary)]">
                    React 19 Architecture Guide
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">#frontend</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 text-[10px] font-bold">#react</span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-h)]">Deep dive into Server Components & Concurrent Mode</h4>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                  <div className="h-28 w-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center font-bold text-xs text-purple-400">
                    UI Design System 2026
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold">#design</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold">#ui</span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-h)]">Building high performance web components with Tailwind</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS GRID */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-h)] tracking-tight">
            Designed for speed, clarity and focus
          </h2>
          <p className="text-sm sm:text-base text-[var(--text)] opacity-80">
            Tagger combines modern metadata extraction with flexible collections and tags so you never lose an important link again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-[var(--code-bg)] border border-[var(--border)] shadow-md space-y-4 hover:border-[var(--primary)] transition-colors group">
            <div className="size-12 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-[var(--text-h)]">
              Instant Metadata Extraction
            </h3>
            <p className="text-xs text-[var(--text)] leading-relaxed opacity-80">
              Paste any URL link and Tagger automatically fetches real-time snapshots, page titles, website logos, and descriptions in milliseconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-[var(--code-bg)] border border-[var(--border)] shadow-md space-y-4 hover:border-[var(--primary)] transition-colors group">
            <div className="size-12 rounded-2xl bg-[var(--secondary)]/15 text-[var(--secondary)] flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              📁
            </div>
            <h3 className="text-lg font-bold text-[var(--text-h)]">
              Smart Multi-Color Collections
            </h3>
            <p className="text-xs text-[var(--text)] leading-relaxed opacity-80">
              Group bookmarks into structured collection folders. Assign vibrant custom colors to visualize and organize your projects easily.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-[var(--code-bg)] border border-[var(--border)] shadow-md space-y-4 hover:border-[var(--primary)] transition-colors group">
            <div className="size-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              🏷️
            </div>
            <h3 className="text-lg font-bold text-[var(--text-h)]">
              Lightweight Hashtag System
            </h3>
            <p className="text-xs text-[var(--text)] leading-relaxed opacity-80">
              Cross-cut your bookmarks with lightweight hashtags. Filter across all collections simultaneously with single-click multi-select controls.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE FEATURE DEMO SECTION */}
      <section id="demo" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--code-bg)] border border-[var(--border)] shadow-2xl space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider">
              Interactive Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-h)]">
              Experience the Tagger Workflow
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab("metadata")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "metadata"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              ⚡ Metadata Fetcher
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "collections"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              📁 Visual Collections
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "tags"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              🏷️ Tag Filtering
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "theme"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              🌗 Dark & Light Engine
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] min-h-[220px] flex items-center justify-center text-center">
            {activeTab === "metadata" && (
              <div className="space-y-3 max-w-md">
                <div className="size-12 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] mx-auto flex items-center justify-center font-bold text-xl">⚡</div>
                <h3 className="text-base font-bold text-[var(--text-h)]">Automated Link Scraping</h3>
                <p className="text-xs text-[var(--text)] opacity-80 leading-relaxed">
                  Simply paste any website link. Tagger calls high-speed backend scrapers to automatically generate title cards, article snippets, and snapshot images.
                </p>
              </div>
            )}

            {activeTab === "collections" && (
              <div className="space-y-3 max-w-md">
                <div className="size-12 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center font-bold text-xl">📁</div>
                <h3 className="text-base font-bold text-[var(--text-h)]">Custom Colored Folders</h3>
                <p className="text-xs text-[var(--text)] opacity-80 leading-relaxed">
                  Organize bookmarks into folders with full color customization. Renaming or deleting collections automatically cascades changes across all cards.
                </p>
              </div>
            )}

            {activeTab === "tags" && (
              <div className="space-y-3 max-w-md">
                <div className="size-12 rounded-full bg-purple-500/15 text-purple-400 mx-auto flex items-center justify-center font-bold text-xl">🏷️</div>
                <h3 className="text-base font-bold text-[var(--text-h)]">Multi-Select Filtering</h3>
                <p className="text-xs text-[var(--text)] opacity-80 leading-relaxed">
                  Combine multiple hashtags and collections with instant client-side filtering. Easily search across thousands of bookmarks with sub-50ms latency.
                </p>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-3 max-w-md">
                <div className="size-12 rounded-full bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center font-bold text-xl">🌗</div>
                <h3 className="text-base font-bold text-[var(--text-h)]">Circular View Transitions</h3>
                <p className="text-xs text-[var(--text)] opacity-80 leading-relaxed">
                  Enjoy fluid, circular clip-path theme switching powered by modern Web APIs and custom CSS tokens designed for high legibility.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. STATS & PERFORMANCE RIBBON */}
      <section id="performance" className="py-16 px-6 max-w-7xl mx-auto border-t border-b border-[var(--border)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-h)] font-mono">100k+</div>
            <div className="text-xs font-semibold text-[var(--text)] opacity-75">Bookmarks Organized</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--primary)] font-mono">&lt; 50ms</div>
            <div className="text-xs font-semibold text-[var(--text)] opacity-75">Search Filter Speed</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-h)] font-mono">99.9%</div>
            <div className="text-xs font-semibold text-[var(--text)] opacity-75">Metadata Extraction</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--primary)] font-mono">4.9/5</div>
            <div className="text-xs font-semibold text-[var(--text)] opacity-75">User Experience Rating</div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION BANNER */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-[var(--primary)]/15 via-[var(--accent)]/10 to-[var(--secondary)]/15 border border-[var(--accent-border)] space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-h)]">
            Ready to organize your digital world?
          </h2>
          <p className="text-sm text-[var(--text)] max-w-xl mx-auto opacity-90">
            Join thousands of users who structure their web links, research, and ideas with Tagger today.
          </p>

          <div className="pt-2">
            {isLoggedIn ? (
              <button
                onClick={onOpenApp}
                className="px-8 py-4 text-sm font-extrabold rounded-2xl bg-[var(--primary)] text-white hover:opacity-95 shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Open Workspace Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => onNavigateToAuth("signup")}
                className="px-8 py-4 text-sm font-extrabold rounded-2xl bg-[var(--primary)] text-white hover:opacity-95 shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Get Started for Free</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-[var(--border)] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text)] opacity-70">
          <div className="flex items-center gap-2 font-bold text-[var(--text-h)]">
            <div className="size-6 rounded-lg bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">T</div>
            <span>Tagger</span>
          </div>
          <div>© {new Date().getFullYear()} Tagger Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-[var(--primary)]">Privacy</a>
            <a href="#features" className="hover:text-[var(--primary)]">Terms</a>
            <a href="#features" className="hover:text-[var(--primary)]">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
