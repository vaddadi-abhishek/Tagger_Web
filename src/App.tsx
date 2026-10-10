import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import DashboardLayout from "./Layout/DashboardLayout";
import { ReaderPage } from "./components/ReaderPage";
import {
  getCurrentUser,
  logoutUser,
  attemptTokenRefresh,
  isTokenExpired,
  getCachedUser,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from "./services/api";

export default function App() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Synchronously restore cached user to avoid 50s cold-start block
  const cachedUser = getCachedUser();
  const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(cachedUser && hasToken));
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => cachedUser);

  // If user is at root "/" and not on OAuth callback, never block the marketing page
  const isRootRoute = typeof window !== "undefined" && window.location.pathname === "/";
  const isOAuthRedirect =
    typeof window !== "undefined" &&
    (window.location.hash.includes("access_token") ||
      window.location.search.includes("access_token"));

  const [initializing, setInitializing] = useState<boolean>(() => {
    if (isOAuthRedirect) return true;
    if (isRootRoute) return false;
    // On protected routes, if we have cached credentials, let the route mount with skeletons
    if (cachedUser && hasToken) return false;
    return true;
  });

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
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [navigate]);

  // Proactive background keep-alive: Periodically refreshes access tokens before expiration
  // and immediately upon tab focus / device wake / cross-tab storage changes
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkAndRefreshSession = async () => {
      const token = localStorage.getItem("mindspace_auth_token");
      const refreshToken = localStorage.getItem("mindspace_refresh_token");
      if (!refreshToken) return;

      // Silently refresh if token is within safety buffer (5 minutes) of expiring or already expired
      if (isTokenExpired(token, 300)) {
        await attemptTokenRefresh();
      }
    };

    // Check periodically every 60 seconds
    const intervalId = setInterval(checkAndRefreshSession, 60 * 1000);

    // Refresh immediately when user returns to tab or wakes computer from sleep
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshSession();
      }
    };

    // Keep tabs in sync if user signs out in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mindspace_auth_token" && !e.newValue) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLoggedIn]);

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
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2160 2160"
            className="size-8 text-black dark:text-white shrink-0 animate-pulse"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M1889.99,1579.72c-101.01,6.82-157.15-183.89-157.15-183.89-163.74-418.741-462.55-489.4-462.55-489.4C1030.34,815.759,825.519,918.3,825.519,918.3c7.825-21.526,77.093-74.152,77.093-74.152C1213.45,691.364,1546.04,944.989,1546.04,944.989c296.98,211.521,385.47,501.261,385.47,501.261C1985.47,1592.57,1889.99,1579.72,1889.99,1579.72ZM1305.87,725.5c-277.9-143.8-501.106,169.064-501.106,169.064s-73.451,100.6-133.43,222.454c-54.219,110.15-118.6,246.18-118.6,246.18-103.081,217.82-225.348,186.86-225.348,186.86-174.893-28.28-100.814-228.38-100.814-228.38s18.661-78.27,145.29-222.46C536.669,911.564,617.962,909.4,617.962,909.4L546.8,1036.94c-74.869,51.9-177.907,174.99-177.907,174.99-133.986,194.84-38.546,204.66-38.546,204.66,69.124,7.23,148.848-148.52,189.767-252.11,75.054-190.014,234.244-394.488,234.244-394.488C1017.7,485.069,1246.57,606.86,1246.57,606.86,1479.51,687.5,1626.1,977.615,1626.1,977.615,1354.98,721.611,1305.87,725.5,1305.87,725.5Z"
            />
          </svg>
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
