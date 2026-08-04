import Nav from "../templates/nav.tsx";
import SideNav from "../templates/sidenav.tsx";
import BookmarksScreen from "../templates/bookmarks.tsx";
import { useState } from "react";

function DashboardLayout() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <SideNav
        isSideNavOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Nav onToggle={() => setIsSideNavOpen((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg)]">
          <BookmarksScreen />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;