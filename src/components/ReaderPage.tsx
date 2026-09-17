import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBookmarkArticle } from "../services/api";
import type { ArticleContent } from "../types/bookmark";

interface ReaderPageProps {
  user?: { name: string; email: string } | null;
}

type ReaderTheme = "warm" | "dark" | "light";
type ReaderFontSize = "sm" | "base" | "lg" | "xl";

export const ReaderPage: React.FC<ReaderPageProps> = () => {
  const { articleId } = useParams<{ articleId: string }>();

  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reader customization state
  const [theme, setTheme] = useState<ReaderTheme>("warm");
  const [fontSize, setFontSize] = useState<ReaderFontSize>("base");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fetch article content on mount or param change
  useEffect(() => {
    if (!articleId) {
      setError("Missing article identifier.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchBookmarkArticle(articleId)
      .then((data) => {
        if (isMounted) {
          setArticle(data);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to load reader mode.";
          setError(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = window.scrollY;
        const progress = Math.min(100, Math.max(0, (current / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set document title
  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} · Mindspace Reader`;
    } else {
      document.title = "Reader Mode · Mindspace";
    }
  }, [article]);

  // Font size multiplier
  const fontSizeClass = useMemo(() => {
    switch (fontSize) {
      case "sm":
        return "text-[15px] leading-[1.75]";
      case "lg":
        return "text-[19px] leading-[1.85]";
      case "xl":
        return "text-[21px] leading-[1.9]";
      default:
        return "text-[17px] leading-[1.8]";
    }
  }, [fontSize]);

  // Dynamic theme wrapper styles
  const themeStyles = useMemo(() => {
    switch (theme) {
      case "dark":
        return {
          bg: "bg-[#161513]",
          text: "text-[#e8e2d8]",
          subtext: "text-[#9e9589]",
          border: "border-[#2b2824]",
          divider: "bg-[#2b2824]",
          preBg: "bg-[#1f1d1a]",
          navBg: "bg-[#161513]/90",
          controlBg: "bg-[#23201d]",
          controlHover: "hover:bg-[#2c2824]",
          accent: "text-[#d6855f]",
          quoteBorder: "border-[#d6855f]/50",
        };
      case "light":
        return {
          bg: "bg-[#ffffff]",
          text: "text-[#1d1c16]",
          subtext: "text-[#645a51]",
          border: "border-[#e5e7eb]",
          divider: "bg-[#e5e7eb]",
          preBg: "bg-[#f3f4f6]",
          navBg: "bg-[#ffffff]/90",
          controlBg: "bg-[#f9fafb]",
          controlHover: "hover:bg-[#f3f4f6]",
          accent: "text-[#c06c46]",
          quoteBorder: "border-[#c06c46]/50",
        };
      case "warm":
      default:
        return {
          bg: "bg-[#faf7f2]",
          text: "text-[#2d261e]",
          subtext: "text-[#75685d]",
          border: "border-[#e8decb]",
          divider: "bg-[#e8decb]/80",
          preBg: "bg-[#f2ece2]",
          navBg: "bg-[#faf7f2]/90",
          controlBg: "bg-[#f4eee4]",
          controlHover: "hover:bg-[#ece4d6]",
          accent: "text-[#c06c46]",
          quoteBorder: "border-[#c06c46]/40",
        };
    }
  }, [theme]);

  // Format creation date
  const formattedDate = useMemo(() => {
    if (!article?.created_at) return null;
    try {
      return new Date(article.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [article?.created_at]);

  return (
    <div
      className={`min-h-screen ${themeStyles.bg} ${themeStyles.text} font-sans antialiased transition-colors duration-300 relative selection:bg-[#c06c46]/20 selection:text-[#2d261e]`}
    >
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-[#c06c46] z-50 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Floating Header & Navigation Controls */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
          {/* Subtle side logo / Back to App */}
          <Link
            to="/my/app"
            aria-label="Mindspace Home"
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="size-8 rounded-lg bg-gradient-to-tr from-[#B5814C] to-[#996533] text-[#FAF8F5] flex items-center justify-center font-bold text-sm shadow-xs shadow-[#B5814C]/20 transition-transform group-hover:scale-105">
              M
            </div>
            <span className={`text-xs uppercase tracking-widest font-semibold ${themeStyles.subtext} opacity-70 group-hover:opacity-100 transition-opacity hidden sm:inline`}>
              Mindspace
            </span>
          </Link>

          {/* Reading Tools: Font size & Theme selectors */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Size Adjusters */}
            <div className={`flex items-center rounded-full p-1 border ${themeStyles.border} ${themeStyles.controlBg} shadow-2xs`}>
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                title="Small font size"
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  fontSize === "sm" ? "bg-[#c06c46] text-white shadow-2xs" : `${themeStyles.subtext} ${themeStyles.controlHover}`
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize("base")}
                title="Default font size"
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  fontSize === "base" ? "bg-[#c06c46] text-white shadow-2xs" : `${themeStyles.subtext} ${themeStyles.controlHover}`
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                title="Large font size"
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  fontSize === "lg" ? "bg-[#c06c46] text-white shadow-2xs" : `${themeStyles.subtext} ${themeStyles.controlHover}`
                }`}
              >
                A+
              </button>
            </div>

            {/* Theme Toggle (Warm / Dark / Light) */}
            <div className={`flex items-center rounded-full p-1 border ${themeStyles.border} ${themeStyles.controlBg} shadow-2xs`}>
              <button
                type="button"
                onClick={() => setTheme("warm")}
                title="Warm Cream Theme"
                className={`size-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  theme === "warm" ? "ring-2 ring-[#c06c46] ring-offset-1 bg-[#faf7f2]" : "opacity-60 hover:opacity-100 bg-[#faf7f2]"
                }`}
              >
                <span className="size-2.5 rounded-full bg-[#c06c46]" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                title="Dark Theme"
                className={`size-6 rounded-full flex items-center justify-center text-xs transition-all ml-1 ${
                  theme === "dark" ? "ring-2 ring-[#c06c46] ring-offset-1 bg-[#161513]" : "opacity-60 hover:opacity-100 bg-[#161513]"
                }`}
              >
                <span className="size-2.5 rounded-full bg-[#9e9589]" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Light Theme"
                className={`size-6 rounded-full flex items-center justify-center text-xs transition-all ml-1 ${
                  theme === "light" ? "ring-2 ring-[#c06c46] ring-offset-1 bg-[#ffffff]" : "opacity-60 hover:opacity-100 bg-[#ffffff]"
                }`}
              >
                <span className="size-2.5 rounded-full bg-[#1d1c16]" />
              </button>
            </div>

            {/* Visit Original URL Button */}
            {article?.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                title="Open original website"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${themeStyles.border} ${themeStyles.controlBg} ${themeStyles.subtext} ${themeStyles.controlHover} transition-all shadow-2xs`}
              >
                <span>Original</span>
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Central Content Area */}
      <main className="w-full max-w-[70ch] mx-auto px-7 sm:px-10 md:px-0 pt-28 sm:pt-36 md:pt-40 pb-32">
        {loading ? (
          // Elegant Editorial Skeleton
          <div className="space-y-12 animate-pulse">
            <div className="space-y-6">
              <div className="h-3 w-28 bg-[#e8decb]/60 dark:bg-[#2b2824] rounded-full" />
              <div className="h-10 w-4/5 bg-[#e8decb]/70 dark:bg-[#2b2824] rounded-lg" />
              <div className="h-10 w-3/5 bg-[#e8decb]/50 dark:bg-[#2b2824] rounded-lg" />
              <div className="h-5 w-full bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md mt-6" />
              <div className="h-5 w-2/3 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md" />
            </div>

            <div className={`w-12 h-px ${themeStyles.divider}`} />

            <div className="space-y-4">
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-full" />
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-full" />
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-11/12" />
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-4/5" />
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-full" />
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-10/12" />
              <div className="h-4 bg-[#e8decb]/40 dark:bg-[#2b2824] rounded-md w-full" />
            </div>
          </div>
        ) : error || !article ? (
          // Clean 404 / Error Screen
          <div className="text-center py-20 space-y-6">
            <div className="size-12 rounded-full bg-[#c06c46]/10 text-[#c06c46] flex items-center justify-center mx-auto">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Article Unavailable in Reader Mode</h2>
            <p className={`text-sm ${themeStyles.subtext} max-w-md mx-auto`}>
              {error || "This article may not have been extracted or is still processing."}
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                to="/my/app"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#c06c46] text-white hover:bg-[#a85b37] transition-colors"
              >
                Return to Mindspace
              </Link>
            </div>
          </div>
        ) : (
          // Full Reader Mode Article Content
          <article className="space-y-12 sm:space-y-16">
            {/* Header Region */}
            <header className="space-y-6 sm:space-y-8">
              {/* Kicker / Category / Site */}
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#9b8d81] dark:text-[#9e9589] font-medium select-none flex items-center gap-2">
                <span>{article.site_name || "Essays & Articles"}</span>
                {article.reading_time_minutes ? (
                  <>
                    <span>·</span>
                    <span>{article.reading_time_minutes} min read</span>
                  </>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-[2.95rem] font-bold tracking-[-0.03em] leading-[1.16] text-balance">
                {article.title || "Untitled Document"}
              </h1>

              {/* Excerpt / Description */}
              {article.description && (
                <p className={`text-base sm:text-lg md:text-xl ${themeStyles.subtext} font-normal leading-relaxed sm:leading-[1.75] tracking-[-0.01em] text-balance`}>
                  {article.description}
                </p>
              )}

              {/* Metadata row */}
              <div className={`flex flex-wrap items-center gap-4 text-xs ${themeStyles.subtext} pt-1`}>
                {formattedDate && <span>Saved on {formattedDate}</span>}
                {article.word_count ? (
                  <>
                    <span>·</span>
                    <span>{article.word_count.toLocaleString()} words</span>
                  </>
                ) : null}
              </div>
            </header>

            {/* Minimalist divider line */}
            <div className={`w-12 h-px ${themeStyles.divider}`} />

            {/* Render Article HTML */}
            <div
              className={`reader-body ${fontSizeClass}`}
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />

            {/* Colophon / Signoff */}
            <footer className={`pt-16 sm:pt-24 mt-20 sm:mt-28 border-t ${themeStyles.border}`}>
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${themeStyles.subtext} font-normal`}>
                <p>{article.site_name || "Web Article"} · Curated in Mindspace</p>
                <span className="text-[11px] opacity-75 tracking-wider uppercase font-medium">
                  Reader View
                </span>
              </div>
            </footer>
          </article>
        )}
      </main>

      {/* Embedded Reader Body Styles to match Stitch Design Typography */}
      <style>{`
        .reader-body h1 {
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          line-height: 1.25;
        }
        .reader-body h2 {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-top: 2.75rem;
          margin-bottom: 1.25rem;
          line-height: 1.3;
        }
        .reader-body h3 {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          margin-top: 2.25rem;
          margin-bottom: 1rem;
          line-height: 1.35;
        }
        .reader-body p {
          margin-bottom: 1.5rem;
          letter-spacing: -0.005em;
        }
        .reader-body blockquote {
          margin: 2.5rem 0;
          padding-left: 1.5rem;
          border-left: 2px solid rgba(192, 108, 70, 0.45);
          font-style: italic;
          font-size: 1.15em;
          line-height: 1.65;
          opacity: 0.95;
        }
        .reader-body figure {
          margin: 2.5rem 0;
        }
        .reader-body img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem auto;
          display: block;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .reader-body figcaption {
          text-align: center;
          font-size: 0.825rem;
          margin-top: 0.75rem;
          opacity: 0.7;
        }
        .reader-body pre {
          background: rgba(0, 0, 0, 0.04);
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-size: 0.9em;
          margin: 1.75rem 0;
        }
        .reader-body code {
          background: rgba(192, 108, 70, 0.08);
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          font-size: 0.88em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .reader-body pre code {
          background: transparent;
          padding: 0;
        }
        .reader-body ul,
        .reader-body ol {
          margin: 1.5rem 0;
          padding-left: 1.75rem;
        }
        .reader-body ul {
          list-style-type: disc;
        }
        .reader-body ol {
          list-style-type: decimal;
        }
        .reader-body li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }
        .reader-body a {
          color: #c06c46;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .reader-body a:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
