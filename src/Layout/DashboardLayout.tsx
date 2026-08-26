import Nav from "../templates/nav.tsx";
import SideNav from "../templates/sidenav.tsx";
import { useState, lazy, Suspense } from "react";
import { ScreenSkeleton } from "../components/ui/ScreenSkeleton.tsx";

import type { RedditBookmark } from "../types/bookmark.ts";
import type { CollectionItem } from "../types/collection.ts";
import type { TagItem } from "../types/tag.ts";
import { fetchUrlMetadata } from "../services/api.ts";

// Lazy-loaded screen components for full app UI/UX lazy loading & performance optimization
const BookmarksScreen = lazy(() => import("../templates/bookmarks.tsx"));
const CollectionsScreen = lazy(() => import("../templates/collections.tsx"));
const TagsScreen = lazy(() => import("../templates/tags.tsx"));

interface ToastNotification {
  id: string;
  message: string;
}

function DashboardLayout() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"home" | "collections" | "tags">("home");

  // Selected filter collections and tags for Home screen (separate from search bar text!)
  const [selectedFilterCollections, setSelectedFilterCollections] = useState<string[]>([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Floating Warning Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // In-memory state for Bookmarks, Collections, and Tags
  const [bookmarks, setBookmarks] = useState<RedditBookmark[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);


  // Compute dynamic counts for each collection based on current bookmarks
  const computedCollections = collections.map((col) => {
    const count = bookmarks.filter((b) =>
      b.collections?.some((c) => c.toLowerCase() === col.name.toLowerCase())
    ).length;
    return { ...col, count };
  });

  // Compute dynamic counts for each tag based on current bookmarks
  const computedTags = tags.map((t) => {
    const cleanTagName = t.name.toLowerCase().replace(/^#/, "");
    const count = bookmarks.filter((b) =>
      b.tags.some((tag) => tag.toLowerCase().replace(/^#/, "") === cleanTagName)
    ).length;
    return { ...t, count };
  });

  // Add Bookmark Handler: Adds card immediately to UI & fetches metadata asynchronously in background
  const handleAddBookmark = (
    newBookmark: RedditBookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => {
    // 1. Instantly display card on Home screen with isFetchingMetadata: true
    setBookmarks((prev) => [newBookmark, ...prev]);

    if (newCol) {
      setCollections((prev) => {
        const exists = prev.some(
          (c) => c.name.toLowerCase() === newCol.name.toLowerCase()
        );
        return exists ? prev : [...prev, newCol];
      });
    }

    if (newTagsList && newTagsList.length > 0) {
      setTags((prev) => {
        const updated = [...prev];
        newTagsList.forEach((nt) => {
          if (!updated.some((t) => t.name.toLowerCase() === nt.name.toLowerCase())) {
            updated.push(nt);
          }
        });
        return updated;
      });
    }

    // 2. Fetch metadata from API backend asynchronously & update card upon response
    const targetUrl = newBookmark.url || newBookmark.permalink;
    fetchUrlMetadata(targetUrl)
      .then((data) => {
        setBookmarks((prev) =>
          prev.map((b) => {
            if (b.id !== newBookmark.id) return b;

            const isImageUrl = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(b.url || "");
            const newThumbnail =
              data.snapshot ||
              data.logo ||
              (isImageUrl ? b.url : b.thumbnail);

            const derivedSource = data.site_name || b.source;

            return {
              ...b,
              title: data.title || b.title,
              selftext: data.description || b.selftext,
              thumbnail: newThumbnail || b.thumbnail,
              source: derivedSource,
              subreddit: b.collections?.[0]
                ? `r/${b.collections[0]}`
                : `r/${derivedSource}`,
              createdAt: data.published_at || b.createdAt,
              isFetchingMetadata: false,
            };
          })
        );
      })
      .catch((err: any) => {
        // Clear background fetching spinner/skeleton on bookmark card
        setBookmarks((prev) =>
          prev.map((b) =>
            b.id === newBookmark.id ? { ...b, isFetchingMetadata: false } : b
          )
        );

        // Show floating top-right warning notification
        const errorMessage = err?.message || "Metadata API server unreachable";
        addToast(`Failed to fetch metadata for ${newBookmark.title}: ${errorMessage}`);
      });
  };

  // Delete Bookmark Handler
  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Collections state change handler (Rename / Delete / Color / Create)
  const handleCollectionsChange = (updatedCollections: CollectionItem[]) => {
    setBookmarks((prevBookmarks) => {
      let updatedBookmarks = [...prevBookmarks];

      // 1. Cascade Deletions
      const deletedCollections = collections.filter(
        (oldCol) => !updatedCollections.some((c) => c.id === oldCol.id)
      );
      deletedCollections.forEach((delCol) => {
        const delNameLower = delCol.name.toLowerCase();
        updatedBookmarks = updatedBookmarks.map((b) => ({
          ...b,
          collections: b.collections?.filter(
            (c) => c.toLowerCase() !== delNameLower
          ),
        }));
      });

      // 2. Cascade Renames
      updatedCollections.forEach((newCol) => {
        const oldCol = collections.find((c) => c.id === newCol.id);
        if (oldCol && oldCol.name !== newCol.name) {
          const oldNameLower = oldCol.name.toLowerCase();
          updatedBookmarks = updatedBookmarks.map((b) => ({
            ...b,
            collections: b.collections?.map((c) =>
              c.toLowerCase() === oldNameLower ? newCol.name : c
            ),
          }));
        }
      });

      return updatedBookmarks;
    });

    setCollections(updatedCollections);
  };

  // Tags state change handler (Rename / Delete / Color / Create)
  const handleTagsChange = (updatedTags: TagItem[]) => {
    setBookmarks((prevBookmarks) => {
      let updatedBookmarks = [...prevBookmarks];

      // 1. Cascade Deletions
      const deletedTags = tags.filter(
        (oldTag) => !updatedTags.some((t) => t.id === oldTag.id)
      );
      deletedTags.forEach((delTag) => {
        const delNameLower = delTag.name.toLowerCase().replace(/^#/, "");
        updatedBookmarks = updatedBookmarks.map((b) => ({
          ...b,
          tags: b.tags.filter(
            (t) => t.toLowerCase().replace(/^#/, "") !== delNameLower
          ),
        }));
      });

      // 2. Cascade Renames
      updatedTags.forEach((newTag) => {
        const oldTag = tags.find((t) => t.id === newTag.id);
        if (oldTag && oldTag.name !== newTag.name) {
          const oldNameLower = oldTag.name.toLowerCase().replace(/^#/, "");
          const cleanNewName = newTag.name.replace(/^#/, "");
          updatedBookmarks = updatedBookmarks.map((b) => ({
            ...b,
            tags: b.tags.map((t) => {
              const cleanT = t.toLowerCase().replace(/^#/, "");
              if (cleanT === oldNameLower) {
                return t.startsWith("#") ? `#${cleanNewName}` : cleanNewName;
              }
              return t;
            }),
          }));
        }
      });

      return updatedBookmarks;
    });

    setTags(updatedTags);
  };

  // SideNav Collapsible Collection Click: Add to selectedFilterCollections and switch to Home
  const handleSelectCollectionFilterFromSideNav = (colName: string) => {
    setActiveScreen("home");
    setSelectedFilterCollections((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === colName.toLowerCase());
      return exists ? prev : [...prev, colName];
    });
  };

  // SideNav Collapsible Tag Click: Add to selectedFilterTags and switch to Home
  const handleSelectTagFilterFromSideNav = (tagName: string) => {
    setActiveScreen("home");
    setSelectedFilterTags((prev) => {
      const cleanT = tagName.toLowerCase().replace(/^#/, "");
      const exists = prev.some((t) => t.toLowerCase().replace(/^#/, "") === cleanT);
      return exists ? prev : [...prev, tagName];
    });
  };

  // Main Nav screen selection handler
  const handleSelectScreen = (screen: "home" | "collections" | "tags") => {
    setActiveScreen(screen);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 relative">
      {/* Top-Right Floating Warning Toast Notifications */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-amber-950/90 border border-amber-500/50 text-amber-200 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-5 text-amber-400 shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1 text-xs">
              <span className="font-bold text-amber-300 block mb-0.5">Metadata Warning</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-amber-400 hover:text-white cursor-pointer p-0.5 text-xs font-bold"
              title="Dismiss warning"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <SideNav
        isSideNavOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
        activeScreen={activeScreen}
        onSelectScreen={handleSelectScreen}
        collections={computedCollections}
        tags={computedTags}
        onSelectCollectionFilter={handleSelectCollectionFilterFromSideNav}
        onSelectTagFilter={handleSelectTagFilterFromSideNav}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Nav onToggle={() => setIsSideNavOpen((prev) => !prev)} />

        <main
          className={`flex-1 p-4 sm:p-6 pb-28 sm:pb-10 bg-[var(--bg)] transition-colors duration-300 ${
            isSideNavOpen ? "overflow-hidden md:overflow-y-auto" : "overflow-y-auto"
          }`}
        >
          <Suspense fallback={<ScreenSkeleton />}>
            {activeScreen === "home" && (
              <BookmarksScreen
                bookmarks={bookmarks}
                collections={computedCollections}
                tags={computedTags}
                onAddBookmark={handleAddBookmark}
                onDeleteBookmark={handleDeleteBookmark}
                selectedFilterCollections={selectedFilterCollections}
                onSelectFilterCollectionsChange={setSelectedFilterCollections}
                selectedFilterTags={selectedFilterTags}
                onSelectFilterTagsChange={setSelectedFilterTags}
              />
            )}
            {activeScreen === "collections" && (
              <CollectionsScreen
                collections={computedCollections}
                onCollectionsChange={handleCollectionsChange}
              />
            )}
            {activeScreen === "tags" && (
              <TagsScreen
                tags={computedTags}
                onTagsChange={handleTagsChange}
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;