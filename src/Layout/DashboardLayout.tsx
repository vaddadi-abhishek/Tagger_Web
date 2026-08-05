import Nav from "../templates/nav.tsx";
import SideNav from "../templates/sidenav.tsx";
import BookmarksScreen from "../templates/bookmarks.tsx";
import CollectionsScreen from "../templates/collections.tsx";
import TagsScreen from "../templates/tags.tsx";
import { useState, useEffect } from "react";

import type { RedditBookmark } from "../types/bookmark.ts";
import type { CollectionItem } from "../types/collection.ts";
import type { TagItem } from "../types/tag.ts";

function DashboardLayout() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"home" | "collections" | "tags">("home");

  // Selected filter collections and tags for Home screen (separate from search bar text!)
  const [selectedFilterCollections, setSelectedFilterCollections] = useState<string[]>([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Real LocalStorage state for Bookmarks, Collections, and Tags
  const [bookmarks, setBookmarks] = useState<RedditBookmark[]>(() => {
    const saved = localStorage.getItem("tagger_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    const saved = localStorage.getItem("tagger_collections");
    return saved ? JSON.parse(saved) : [];
  });

  const [tags, setTags] = useState<TagItem[]>(() => {
    const saved = localStorage.getItem("tagger_tags");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("tagger_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("tagger_collections", JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem("tagger_tags", JSON.stringify(tags));
  }, [tags]);

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

  // Add Bookmark Handler
  const handleAddBookmark = (
    newBookmark: RedditBookmark,
    newCol?: CollectionItem,
    newTagsList?: TagItem[]
  ) => {
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
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
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
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;