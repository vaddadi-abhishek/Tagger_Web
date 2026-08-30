import Nav from "../templates/nav.tsx";
import SideNav from "../templates/sidenav.tsx";
import { useState, useEffect, lazy, Suspense } from "react";
import { ScreenSkeleton } from "../components/ui/ScreenSkeleton.tsx";

import type { Bookmark } from "../types/bookmark.ts";
import type { CollectionItem } from "../types/collection.ts";
import type { TagItem } from "../types/tag.ts";
import { fetchUrlMetadata } from "../services/api.ts";
import {
  fetchCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchBookmarks,
  createBookmark,
  updateBookmarkMetadata,
  updateBookmarkDetails,
  updateBookmarkCollections,
  updateBookmarkTags,
  deleteBookmark,
} from "../services/supabaseDataService.ts";

// Lazy-loaded screen components for full app UI/UX lazy loading & performance optimization
const BookmarksScreen = lazy(() => import("../templates/bookmarks.tsx"));
const CollectionsScreen = lazy(() => import("../templates/collections.tsx"));
const TagsScreen = lazy(() => import("../templates/tags.tsx"));

interface ToastNotification {
  id: string;
  message: string;
}

interface DashboardLayoutProps {
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
}

function DashboardLayout({ user, onSignOut }: DashboardLayoutProps) {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"home" | "collections" | "tags">("home");

  // Search term state for Top Navbar Search Input
  const [searchTerm, setSearchTerm] = useState("");

  // Selected filter collections and tags for Home screen (separate from search bar text!)
  const [selectedFilterCollections, setSelectedFilterCollections] = useState<string[]>([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Floating Toast Notifications State
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

  // State for Bookmarks, Collections, and Tags
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Initial Data Fetch from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setLoadingData(true);
      try {
        const [fetchedCols, fetchedTagsList, fetchedBms] = await Promise.all([
          fetchCollections().catch(() => []),
          fetchTags().catch(() => []),
          fetchBookmarks().catch(() => []),
        ]);

        if (isMounted) {
          setCollections(fetchedCols);
          setTags(fetchedTagsList);
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

  // Add Bookmark Handler: Creates in Supabase & fetches metadata asynchronously
  const handleAddBookmark = async (
    newBookmark: Bookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => {
    try {
      // 1. Ensure any new collection is persisted in Supabase
      let currentCols = [...collections];
      if (newCol) {
        const exists = currentCols.some(
          (c) => c.name.toLowerCase() === newCol.name.toLowerCase()
        );
        if (!exists) {
          try {
            const createdCol = await createCollection(newCol.name, newCol.color);
            currentCols = [...currentCols, createdCol];
            setCollections(currentCols);
          } catch (e: any) {
            console.error("Failed to create collection in Supabase", e);
          }
        }
      }

      if (newBookmark.collections && newBookmark.collections.length > 0) {
        for (const colName of newBookmark.collections) {
          const exists = currentCols.some(
            (c) => c.name.toLowerCase() === colName.toLowerCase()
          );
          if (!exists) {
            try {
              const createdCol = await createCollection(colName, "#f97316");
              currentCols = [...currentCols, createdCol];
              setCollections(currentCols);
            } catch (e) {
              console.error("Failed to create collection in Supabase", e);
            }
          }
        }
      }

      // 2. Ensure any new tags are persisted in Supabase
      let currentTagsList = [...tags];
      if (newTagsList && newTagsList.length > 0) {
        for (const nt of newTagsList) {
          const exists = currentTagsList.some(
            (t) => t.name.toLowerCase().replace(/^#/, "") === nt.name.toLowerCase().replace(/^#/, "")
          );
          if (!exists) {
            try {
              const createdT = await createTag(nt.name, nt.color);
              currentTagsList = [...currentTagsList, createdT];
              setTags(currentTagsList);
            } catch (e) {
              console.error("Failed to create tag in Supabase", e);
            }
          }
        }
      }

      // 3. Map selected collection and tag names to their DB IDs
      const targetColNames = newBookmark.collections || (newCol ? [newCol.name] : []);
      const matchedColIds = currentCols
        .filter((c) => targetColNames.some((tc) => tc.toLowerCase() === c.name.toLowerCase()))
        .map((c) => c.id);

      const targetTagNames = newBookmark.tags || (newTagsList ? newTagsList.map((t) => t.name) : []);
      const matchedTagIds = currentTagsList
        .filter((t) =>
          targetTagNames.some(
            (tt) => tt.toLowerCase().replace(/^#/, "") === t.name.toLowerCase().replace(/^#/, "")
          )
        )
        .map((t) => t.id);

      // 4. Create bookmark record in Supabase
      const savedBookmark = await createBookmark({
        url: newBookmark.url,
        title: newBookmark.title,
        description: newBookmark.description,
        snapshot: newBookmark.snapshot,
        logo: newBookmark.logo,
        site_name: newBookmark.site_name,
        collectionIds: matchedColIds,
        tagIds: matchedTagIds,
        collectionNames: targetColNames,
        tagNames: targetTagNames,
      });

      // Update UI state immediately
      setBookmarks((prev) => [savedBookmark, ...prev]);

      // 5. Fetch metadata asynchronously & update Supabase + local card
      const targetUrl = savedBookmark.url;
      fetchUrlMetadata(targetUrl)
        .then(async (data) => {
          const snapshotUrl = data.snapshot ? data.snapshot : null;
          const logoUrl = data.logo ? data.logo : null;
          const derivedTitle = data.title ? data.title : savedBookmark.title;
          const derivedDescription = data.description ? data.description : savedBookmark.description;
          const derivedSiteName = data.site_name ? data.site_name : savedBookmark.site_name;

          // 1. Update DB record in Supabase
          await updateBookmarkMetadata(savedBookmark.id, {
            title: derivedTitle,
            description: derivedDescription,
            snapshot: snapshotUrl,
            logo: logoUrl,
            site_name: derivedSiteName,
          });

          // 2. Update local state card
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

  // Update Bookmark Collections Handler
  const handleUpdateBookmarkCollections = async (
    id: string,
    newCollections: string[]
  ) => {
    try {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, collections: newCollections } : b))
      );
      const updatedCols = await updateBookmarkCollections(id, newCollections, collections);
      setCollections(updatedCols);
      addToast("Collections updated successfully!");
    } catch (err: any) {
      console.error("Error updating bookmark collections:", err);
      addToast(`Failed to update collections: ${err?.message || "Database update failed"}`);
    }
  };

  // Update Bookmark Tags Handler
  const handleUpdateBookmarkTags = async (
    id: string,
    newTags: string[]
  ) => {
    try {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, tags: newTags } : b))
      );
      const updatedTagsList = await updateBookmarkTags(id, newTags, tags);
      setTags(updatedTagsList);
      addToast("Tags updated successfully!");
    } catch (err: any) {
      console.error("Error updating bookmark tags:", err);
      addToast(`Failed to update tags: ${err?.message || "Database update failed"}`);
    }
  };

  // Collections state change handler (Rename / Delete / Color / Create)
  const handleCollectionsChange = async (updatedCollections: CollectionItem[]) => {
    // 1. Identify additions
    const addedCollections = updatedCollections.filter(
      (newCol) => !collections.some((c) => c.id === newCol.id)
    );
    for (const addCol of addedCollections) {
      try {
        const created = await createCollection(addCol.name, addCol.color);
        updatedCollections = updatedCollections.map((c) =>
          c.id === addCol.id ? created : c
        );
      } catch (e: any) {
        addToast(`Failed to create collection in database: ${e?.message}`);
      }
    }

    // 2. Identify updates (Rename / Color)
    for (const newCol of updatedCollections) {
      const oldCol = collections.find((c) => c.id === newCol.id);
      if (oldCol && (oldCol.name !== newCol.name || oldCol.color !== newCol.color)) {
        try {
          await updateCollection(newCol.id, newCol.name, newCol.color);
        } catch (e: any) {
          addToast(`Failed to update collection: ${e?.message}`);
        }
      }
    }

    // 3. Identify deletions
    const deletedCollections = collections.filter(
      (oldCol) => !updatedCollections.some((c) => c.id === oldCol.id)
    );
    for (const delCol of deletedCollections) {
      try {
        await deleteCollection(delCol.id);
      } catch (e: any) {
        addToast(`Failed to delete collection: ${e?.message}`);
      }
    }

    // Cascade deletions & renames on local bookmarks state
    setBookmarks((prevBookmarks) => {
      let updatedBookmarks = [...prevBookmarks];

      deletedCollections.forEach((delCol) => {
        const delNameLower = delCol.name.toLowerCase();
        updatedBookmarks = updatedBookmarks.map((b) => ({
          ...b,
          collections: b.collections?.filter(
            (c) => c.toLowerCase() !== delNameLower
          ),
        }));
      });

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
  const handleTagsChange = async (updatedTags: TagItem[]) => {
    // 1. Identify additions
    const addedTags = updatedTags.filter(
      (newTag) => !tags.some((t) => t.id === newTag.id)
    );
    for (const addTag of addedTags) {
      try {
        const created = await createTag(addTag.name, addTag.color);
        updatedTags = updatedTags.map((t) =>
          t.id === addTag.id ? created : t
        );
      } catch (e: any) {
        addToast(`Failed to create tag in database: ${e?.message}`);
      }
    }

    // 2. Identify updates (Rename / Color)
    for (const newTag of updatedTags) {
      const oldTag = tags.find((t) => t.id === newTag.id);
      if (oldTag && (oldTag.name !== newTag.name || oldTag.color !== newTag.color)) {
        try {
          await updateTag(newTag.id, newTag.name, newTag.color);
        } catch (e: any) {
          addToast(`Failed to update tag: ${e?.message}`);
        }
      }
    }

    // 3. Identify deletions
    const deletedTags = tags.filter(
      (oldTag) => !updatedTags.some((t) => t.id === oldTag.id)
    );
    for (const delTag of deletedTags) {
      try {
        await deleteTag(delTag.id);
      } catch (e: any) {
        addToast(`Failed to delete tag: ${e?.message}`);
      }
    }

    // Cascade deletions & renames on local bookmarks state
    setBookmarks((prevBookmarks) => {
      let updatedBookmarks = [...prevBookmarks];

      deletedTags.forEach((delTag) => {
        const delNameLower = delTag.name.toLowerCase().replace(/^#/, "");
        updatedBookmarks = updatedBookmarks.map((b) => ({
          ...b,
          tags: b.tags.filter(
            (t) => t.toLowerCase().replace(/^#/, "") !== delNameLower
          ),
        }));
      });

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
    <div className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 relative">
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
              <span className="font-bold text-amber-300 block mb-0.5">Notification</span>
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
        <Nav
          onToggle={() => setIsSideNavOpen((prev) => !prev)}
          user={user}
          onSignOut={onSignOut}
          activeScreen={activeScreen}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main
          className={`flex-1 p-4 sm:p-6 pb-28 sm:pb-10 bg-[var(--bg)] transition-colors duration-300 ${isSideNavOpen ? "overflow-hidden md:overflow-y-auto" : "overflow-y-auto"
            }`}
        >
          {loadingData ? (
            <ScreenSkeleton />
          ) : (
            <Suspense fallback={<ScreenSkeleton />}>
              {activeScreen === "home" && (
                <BookmarksScreen
                  bookmarks={bookmarks}
                  collections={computedCollections}
                  tags={computedTags}
                  onAddBookmark={handleAddBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  onUpdateBookmarkDetails={handleUpdateBookmarkDetails}
                  onUpdateBookmarkCollections={handleUpdateBookmarkCollections}
                  onUpdateBookmarkTags={handleUpdateBookmarkTags}
                  selectedFilterCollections={selectedFilterCollections}
                  onSelectFilterCollectionsChange={setSelectedFilterCollections}
                  selectedFilterTags={selectedFilterTags}
                  onSelectFilterTagsChange={setSelectedFilterTags}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
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
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;