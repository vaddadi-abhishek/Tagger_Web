import Nav from "../templates/nav.tsx";
import { useState, useEffect, lazy, Suspense } from "react";
import { ScreenSkeleton } from "../components/ui/ScreenSkeleton.tsx";
import { BottomNavbar, type BottomNavbarTab } from "../components/ui/BottomNavbar.tsx";

import type { Bookmark } from "../types/bookmark.ts";
import { fetchUrlMetadata } from "../services/api.ts";
import {
  fetchBookmarks,
  createBookmark,
  updateBookmarkMetadata,
  updateBookmarkDetails,
  deleteBookmark,
} from "../services/supabaseDataService.ts";

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

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
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

  // Initial Data Fetch from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setLoadingData(true);
      try {
        const fetchedBms = await fetchBookmarks().catch(() => []);
        if (isMounted) {
          setBookmarks(fetchedBms);
        }
      } catch (err: any) {
        addToast(`Failed to load data from Supabase: ${err?.message || "Unknown error"}`);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add Bookmark Handler: Creates in Supabase & fetches metadata asynchronously
  const handleAddBookmark = async (newBookmark: Bookmark) => {
    try {
      const savedBookmark = await createBookmark({
        url: newBookmark.url,
        title: newBookmark.title,
        description: newBookmark.description,
        snapshot: newBookmark.snapshot,
        logo: newBookmark.logo,
        site_name: newBookmark.site_name,
      });

      // Update UI state immediately
      setBookmarks((prev) => [savedBookmark, ...prev]);

      // Fetch metadata asynchronously & update Supabase + local card
      const targetUrl = savedBookmark.url;
      fetchUrlMetadata(targetUrl)
        .then(async (data) => {
          const snapshotUrl = data.snapshot ? data.snapshot : null;
          const logoUrl = data.logo ? data.logo : null;
          const derivedTitle = data.title ? data.title : savedBookmark.title;
          const derivedDescription = data.description ? data.description : savedBookmark.description;
          const derivedSiteName = data.site_name ? data.site_name : savedBookmark.site_name;

          await updateBookmarkMetadata(savedBookmark.id, {
            title: derivedTitle,
            description: derivedDescription,
            snapshot: snapshotUrl,
            logo: logoUrl,
            site_name: derivedSiteName,
            type: data.type || null,
            card_data: data.card_data || null,
          });

          // Update local state card
          setBookmarks((prev) =>
            prev.map((b) => {
              if (b.id !== savedBookmark.id) return b;
              return {
                ...b,
                title: derivedTitle,
                description: derivedDescription,
                snapshot: snapshotUrl,
                logo: logoUrl,
                site_name: derivedSiteName,
                isFetchingMetadata: false,
                type: data.type || undefined,
                card_data: data.card_data || undefined,
              };
            })
          );
        })
        .catch((err: any) => {
          setBookmarks((prev) =>
            prev.map((b) =>
              b.id === savedBookmark.id ? { ...b, isFetchingMetadata: false } : b
            )
          );
          const errorMessage = err?.message || "Metadata API server unreachable";
          addToast(`Failed to fetch metadata for ${savedBookmark.title}: ${errorMessage}`);
        });
    } catch (err: any) {
      console.error("Failed to add bookmark to Supabase:", err);
      addToast(`Error adding bookmark: ${err?.message || "Database insert failed"}`);
    }
  };

  // Delete Bookmark Handler
  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      console.error("Error deleting bookmark:", err);
      addToast(`Failed to delete bookmark: ${err?.message || "Database operation failed"}`);
    }
  };

  // Update Bookmark Title & Description Handler
  const handleUpdateBookmarkDetails = async (
    id: string,
    title: string,
    description: string
  ) => {
    try {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, title, description } : b))
      );
      await updateBookmarkDetails(id, title, description);
      addToast("Bookmark updated successfully!");
    } catch (err: any) {
      console.error("Error updating bookmark details:", err);
      addToast(`Failed to update bookmark: ${err?.message || "Database update failed"}`);
    }
  };

  const bottomTabs: BottomNavbarTab[] = [
    { id: "all", label: "All" },
    { id: "x", label: "Twitter / X" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "reddit", label: "Reddit" },
  ];

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 relative bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(3,7,18,0))]">
      {/* Bottom-Center Floating macOS Glass Toast HUD Capsule - elevated above bottom navbar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 max-w-lg w-auto pointer-events-none px-4">
        {toasts.map((toast) => {
          const isError =
            toast.type === "error" ||
            /failed|error|unreachable/i.test(toast.message);

          return (
            <div
              key={toast.id}
              className="pointer-events-auto glass-modal px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 border border-black/10 dark:border-white/15 bg-white/85 dark:bg-zinc-900/85 text-[var(--text-h)] whitespace-nowrap max-w-full"
            >
              {isError ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="size-4.5 text-amber-500 shrink-0"
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
                  className="size-4.5 text-emerald-500 shrink-0"
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
          className="flex-1 min-h-0 bg-[var(--bg)] transition-colors duration-300 overflow-y-auto relative"
        >
          <Nav
            user={user}
            onSignOut={onSignOut}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isScrolled={isScrolled}
          />

          <div className="w-full px-4 sm:px-6 lg:px-8 pb-32 sm:pb-36">
            {loadingData ? (
              <ScreenSkeleton />
            ) : (
              <Suspense fallback={<ScreenSkeleton />}>
                <BookmarksScreen
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  onUpdateBookmarkDetails={handleUpdateBookmarkDetails}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activePlatform={activePlatform}
                  isAddModalOpen={isAddModalOpen}
                  onCloseAddModal={() => setIsAddModalOpen(false)}
                />
              </Suspense>
            )}
          </div>
        </main>

        {/* Floating iOS Liquid Glass Bottom Navbar with (+) Add button at end */}
        <BottomNavbar
          activeTab={activePlatform}
          onTabChange={setActivePlatform}
          tabs={bottomTabs}
          onAddClick={() => setIsAddModalOpen(true)}
        />
      </div>
    </div>
  );
}

export default DashboardLayout;