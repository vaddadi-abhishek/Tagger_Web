import Nav from "../templates/nav.tsx";
import SideNav from "../templates/sidenav.tsx";
import BookmarksScreen from "../templates/bookmarks.tsx";
import { useState } from "react";

function DashboardLayout() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <SideNav
        isSideNavOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Nav onToggle={() => setIsSideNavOpen((prev) => !prev)} />

        <main className={`flex-1 p-4 sm:p-6 pb-28 sm:pb-10 bg-[var(--bg)] transition-colors duration-300 ${
          isSideNavOpen ? "overflow-hidden md:overflow-y-auto" : "overflow-y-auto"
        }`}>
          <BookmarksScreen />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;