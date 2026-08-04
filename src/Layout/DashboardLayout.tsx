import Nav from "../templates/nav.tsx";
import SideNav from "../templates/sidenav.tsx";
import BookmarksScreen from "../templates/bookmarks.tsx";
import CollectionsScreen from "../templates/collections.tsx";
import TagsScreen from "../templates/tags.tsx";
import { useState } from "react";

import type { CollectionItem } from "../types/collection.ts";
import type { TagItem } from "../types/tag.ts";
import { INITIAL_COLLECTIONS } from "../dummy_data/collectionsData.ts";
import { INITIAL_TAGS } from "../dummy_data/tagsData.ts";

function DashboardLayout() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"home" | "collections" | "tags">("home");

  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <SideNav
        isSideNavOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        collections={collections}
        tags={tags}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Nav onToggle={() => setIsSideNavOpen((prev) => !prev)} />

        <main
          className={`flex-1 p-4 sm:p-6 pb-28 sm:pb-10 bg-[var(--bg)] transition-colors duration-300 ${
            isSideNavOpen ? "overflow-hidden md:overflow-y-auto" : "overflow-y-auto"
          }`}
        >
          {activeScreen === "home" && <BookmarksScreen />}
          {activeScreen === "collections" && (
            <CollectionsScreen
              collections={collections}
              onCollectionsChange={setCollections}
            />
          )}
          {activeScreen === "tags" && (
            <TagsScreen tags={tags} onTagsChange={setTags} />
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;