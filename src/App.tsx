import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import DashboardLayout from "./Layout/DashboardLayout";

export default function App() {
  const [view, setView] = useState<"landing" | "auth" | "app">("landing");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleNavigateToAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setView("auth");
  };

  const handleOpenApp = () => {
    if (!isLoggedIn) {
      // Protected route: Redirect to Auth Page if logged out
      setAuthMode("login");
      setView("auth");
    } else {
      setView("app");
    }
  };

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setIsLoggedIn(true);
    setUser(userData);
    setView("app"); // Automatically enter app workspace upon successful auth
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView("landing"); // Automatically redirect to Landing Page on sign out
  };

  // Protected View Check: If trying to access "app" while logged out, render Auth Page
  if (view === "app" && !isLoggedIn) {
    return (
      <AuthPage
        initialMode="login"
        onLoginSuccess={handleLoginSuccess}
        onGoToLanding={() => setView("landing")}
      />
    );
  }

  if (view === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onGoToLanding={() => setView("landing")}
      />
    );
  }

  if (view === "app" && isLoggedIn) {
    return (
      <DashboardLayout
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <LandingPage
      isLoggedIn={isLoggedIn}
      user={user}
      onNavigateToAuth={handleNavigateToAuth}
      onOpenApp={handleOpenApp}
    />
  );
}
