import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import DashboardLayout from "./Layout/DashboardLayout";
import { ReaderPage } from "./components/ReaderPage";
import { getCurrentUser, logoutUser } from "./services/api";

export default function App() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Check for Supabase Auth redirect tokens in URL hash (#access_token=...&refresh_token=...)
    // or query string (?access_token=...&refresh_token=...)
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (hash && (hash.includes("access_token") || hash.includes("error"))) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      accessToken = hashParams.get("access_token");
      refreshToken = hashParams.get("refresh_token");
      const errorDesc = hashParams.get("error_description");
      if (errorDesc) {
        console.error("Auth redirect error:", errorDesc);
      }
    } else if (searchParams.has("access_token")) {
      accessToken = searchParams.get("access_token");
      refreshToken = searchParams.get("refresh_token");
    }

    if (accessToken) {
      localStorage.setItem("mindspace_auth_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("mindspace_refresh_token", refreshToken);
      }
      // Clean up the URL to remove the sensitive tokens from browser address bar
      window.history.replaceState(null, "", window.location.pathname);
    }

    // 2. Restore session via Node backend
    getCurrentUser()
      .then((currentUser) => {
        if (currentUser) {
          setIsLoggedIn(true);
          setUser({
            name: currentUser.name,
            email: currentUser.email,
          });
          if (accessToken) {
            navigate("/my/app", { replace: true });
          }
        }
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [navigate]);

  const handleNavigateToAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    navigate("/auth");
  };

  const handleOpenApp = () => {
    if (!isLoggedIn) {
      setAuthMode("login");
      navigate("/auth");
    } else {
      navigate("/my/app");
    }
  };

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setIsLoggedIn(true);
    setUser(userData);
    navigate("/my/app");
  };

  const handleSignOut = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  if (initializing) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-[#B5814C] to-[#996533] text-[#FAF8F5] flex items-center justify-center font-bold text-base shadow-md shadow-[#B5814C]/20 animate-pulse">
            M
          </div>
          <span className="text-sm font-medium text-[var(--text)]">Loading mindspace...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root Route: Always LandingPage */}
      <Route
        path="/"
        element={
          <LandingPage
            isLoggedIn={isLoggedIn}
            user={user}
            onNavigateToAuth={handleNavigateToAuth}
            onOpenApp={handleOpenApp}
          />
        }
      />

      {/* Main App Protected Route: /my/app */}
      <Route
        path="/my/app"
        element={
          isLoggedIn ? (
            <DashboardLayout
              user={user}
              onSignOut={handleSignOut}
            />
          ) : (
            <AuthPage
              initialMode="login"
              onLoginSuccess={handleLoginSuccess}
              onGoToLanding={() => navigate("/")}
            />
          )
        }
      />

      {/* Reader Mode Route: /my/app/:articleId */}
      <Route
        path="/my/app/:articleId"
        element={
          isLoggedIn ? (
            <ReaderPage user={user} />
          ) : (
            <AuthPage
              initialMode="login"
              onLoginSuccess={handleLoginSuccess}
              onGoToLanding={() => navigate("/")}
            />
          )
        }
      />

      {/* Auth Route: /auth */}
      <Route
        path="/auth"
        element={
          isLoggedIn ? (
            <Navigate to="/my/app" replace />
          ) : (
            <AuthPage
              initialMode={authMode}
              onLoginSuccess={handleLoginSuccess}
              onGoToLanding={() => navigate("/")}
            />
          )
        }
      />

      {/* Fallback Route: Redirect unknown routes to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
