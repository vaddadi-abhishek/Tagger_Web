import Nav from "../templates/nav.tsx";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { ScreenSkeleton } from "../components/ui/ScreenSkeleton.tsx";

import type { Bookmark } from "../types/bookmark.ts";
import {
  fetchBookmarks,
  createBookmark,
  triggerGenerateAi,
  deleteBookmark,
  getUserPlan,
  type UserPlanInfo,
} from "../services/api.ts";

// Lazy-loaded bookmarks screen
const BookmarksScreen = lazy(() => import("../templates/bookmarks.tsx"));

interface ToastNotification {
  id: string;
  message: string;
  type?: "success" | "error";
}

interface DashboardLayoutProps {
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
}

function DashboardLayout({ user, onSignOut }: DashboardLayoutProps) {
  // Search term state for Top Navbar Search Input
  const [searchTerm, setSearchTerm] = useState("");

  // Top Navbar Scroll Glassmorphism State
  const [isScrolled, setIsScrolled] = useState(false);

  // Bottom Navbar Active Platform Filter State
  const [activePlatform, setActivePlatform] = useState("all");

  // Create Bookmark Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Auto AI Context Setting (Defaults to true, loaded from user plan)
  const [autoAiContext, setAutoAiContext] = useState(true);
  const [, setUserPlan] = useState<UserPlanInfo | null>(null);

  // ID of bookmark actively generating AI context via 3-dots menu
  const [generatingAiId, setGeneratingAiId] = useState<string | null>(null);

  // Top-Middle Floating "No credits left" badge state (appears for 1.5 - 2s)
  const [showNoCreditsBadge, setShowNoCreditsBadge] = useState(false);
  const noCreditsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerNoCreditsBadge = useCallback(() => {
    if (noCreditsTimeoutRef.current) {
      clearTimeout(noCreditsTimeoutRef.current);
    }
    setShowNoCreditsBadge(true);
    noCreditsTimeoutRef.current = setTimeout(() => {
      setShowNoCreditsBadge(false);
    }, 1800); // Auto-dismisses in 1.8s
  }, []);

  useEffect(() => {
    return () => {
      if (noCreditsTimeoutRef.current) {
        clearTimeout(noCreditsTimeoutRef.current);
      }
    };
  }, []);

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const nextScrolled = e.currentTarget.scrollTop > 10;
    setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
  };

  // Floating Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type?: "success" | "error") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State for Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Initial Data Fetch from Node Backend
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setLoadingData(true);
      try {
        const [fetchedBms, plan] = await Promise.all([
          fetchBookmarks().catch(() => []),
          getUserPlan().catch(() => null),
        ]);
        if (isMounted) {
          setBookmarks(fetchedBms);
          if (plan) {
            setUserPlan(plan);
            setAutoAiContext(plan.auto_ai_context);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addToast(`Failed to load data: ${message}`, "error");
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add Bookmark Handler: Optimistic card + Node backend extraction & credit-gated AI
  const handleAddBookmark = async (newBookmark: Bookmark) => {
    const tempId = `temp_${Date.now()}`;
    // 1. Optimistic lazy-loading card
    const optimisticBookmark: Bookmark = {
      id: tempId,
      url: newBookmark.url,
      title: newBookmark.url,
      description: "Extracting metadata & analyzing...",
      site_name: "",
      logo: null,
      snapshot: null,
      isFetchingMetadata: true,
      created_at: new Date().toISOString(),
    };

    setBookmarks((prev) => [optimisticBookmark, ...prev]);

    try {
      // 2. Call Node backend with autoAiContext (sent as X-Auto-AI-Context header)
      const savedBookmark = await createBookmark(newBookmark.url, autoAiContext);

      // 3. Replace optimistic card with server response
      setBookmarks((prev) => {
        const withoutOld = prev.filter((b) => b.id !== savedBookmark.id && b.id !== tempId);
        return [{ ...savedBookmark, isFetchingMetadata: false }, ...withoutOld];
      });

      if ((savedBookmark as any).already_exists) {
        addToast("Link already in your library! (0 credits used)", "success");
      } else if (savedBookmark.ai_status === "no_credits") {
        triggerNoCreditsBadge();
      } else {
        addToast("Bookmark saved successfully!", "success");
      }
    } catch (err: unknown) {
      // Remove optimistic card if server call failed
      setBookmarks((prev) => prev.filter((b) => b.id !== tempId));
      const errorMessage = err instanceof Error ? err.message : "Database operation failed";
      addToast(`Error adding bookmark: ${errorMessage}`, "error");
    }
  };

  // Manual Trigger: Generate AI Context for a card from the 3-dots menu
  const handleGenerateAiContext = async (bookmark: Bookmark) => {
    setGeneratingAiId(bookmark.id);
    try {
      const updated = await triggerGenerateAi(bookmark.id);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmark.id ? { ...b, ...updated } : b))
      );
      addToast("✨ AI Context generated successfully!", "success");
    } catch (err: any) {
      if (err.code === "NO_CREDITS_LEFT" || err.message?.includes("No free credits")) {
        setBookmarks((prev) =>
          prev.map((b) => (b.id === bookmark.id ? { ...b, ai_status: "no_credits" } : b))
        );
        triggerNoCreditsBadge();
      } else {
        addToast(err.message || "Failed to generate AI context", "error");
      }
    } finally {
      setGeneratingAiId(null);
    }
  };

  // Delete Bookmark Handler
  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      addToast("Bookmark deleted", "success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete";
      addToast(`Failed to delete bookmark: ${errorMessage}`, "error");
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-500 relative bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,159,80,0.12),rgba(250,248,245,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(200,142,62,0.09),rgba(11,9,7,0))]">
      {/* Top-Middle Floating "No credits left" Badge (Appears for 1.8s then smoothly fades out) */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none transition-all duration-300 ease-out transform ${showNoCreditsBadge
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-4 scale-95"
          }`}
      >
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#FAFAF8]/95 dark:bg-[#1A1816]/95 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>No credits left</span>
        </div>
      </div>

      {/* Bottom-Center Floating Sand Dune Toast HUD Capsule */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 max-w-lg w-auto pointer-events-none px-4">
        {toasts.map((toast) => {
          const isError =
            toast.type === "error" ||
            /failed|error|unreachable/i.test(toast.message);

          return (
            <div
              key={toast.id}
              className="pointer-events-auto px-4 py-2.5 rounded-full shadow-[0_12px_30px_rgba(181,129,76,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] bg-[#FAF8F5]/95 dark:bg-[#14110E]/95 border border-[#B5814C]/35 dark:border-[#C88E3E]/35 flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 text-[var(--text-h)] whitespace-nowrap max-w-full backdrop-blur-md"
            >
              {isError ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="size-4.5 text-[#B5814C] dark:text-[#D99F50] shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span className="text-xs font-semibold text-[var(--text-h)] truncate">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[var(--text)] opacity-50 hover:opacity-100 cursor-pointer p-0.5 text-xs font-bold transition-opacity ml-1"
                title="Dismiss notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <main
          onScroll={handleMainScroll}
          className="flex-1 min-h-0 bg-[var(--bg)] transition-colors duration-500 overflow-y-auto relative selection:bg-amber-500/20 selection:text-amber-900 dark:selection:bg-amber-400/20 dark:selection:text-amber-200"
        >
          {/* Ambient Organic Sand Dune Glow Meshes (Pure CSS, light & dark adaptive) */}
          <div
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            aria-hidden="true"
          >
            {/* Top-right warm amber dune wash */}
            <div className="absolute -top-[18%] right-[-5%] w-[60vw] h-[60vh] rounded-full bg-gradient-to-bl from-[#DEAC62]/20 via-[#B5814C]/10 to-transparent dark:from-[#C88E3E]/10 dark:via-[#B5814C]/5 dark:to-transparent blur-3xl" />
            {/* Center-left soft warm clay wash */}
            <div className="absolute top-[35%] -left-[12%] w-[60vw] h-[65vh] rounded-full bg-gradient-to-tr from-[#D99F50]/14 via-[#996533]/8 to-transparent dark:from-[#B5814C]/7 dark:via-[#996533]/4 dark:to-transparent blur-3xl" />
            {/* Bottom-right gentle sand crest glow */}
            <div className="absolute -bottom-[15%] right-[15%] w-[50vw] h-[45vh] rounded-full bg-gradient-to-t from-[#B5814C]/10 to-transparent dark:from-[#C88E3E]/6 to-transparent blur-3xl" />
          </div>

          <Nav
            user={user}
            onSignOut={onSignOut}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isScrolled={isScrolled}
          />

          <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
            {loadingData ? (
              <ScreenSkeleton />
            ) : (
              <Suspense fallback={<ScreenSkeleton />}>
                <BookmarksScreen
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  onGenerateAiContext={handleGenerateAiContext}
                  generatingAiId={generatingAiId}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activePlatform={activePlatform}
                  onPlatformChange={setActivePlatform}
                  isAddModalOpen={isAddModalOpen}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onCloseAddModal={() => setIsAddModalOpen(false)}
                />
              </Suspense>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;