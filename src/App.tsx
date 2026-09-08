import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import DashboardLayout from "./Layout/DashboardLayout";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [initializing, setInitializing] = useState(() => isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Restore existing session from localStorage/cookies on page reload
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const displayName =
          metadata.username ||
          metadata.name ||
          session.user.email?.split("@")[0] ||
          "User";

        setIsLoggedIn(true);
        setUser({
          name: displayName,
          email: session.user.email || "",
        });
      }
      setInitializing(false);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const displayName =
          metadata.username ||
          metadata.name ||
          session.user.email?.split("@")[0] ||
          "User";

        setIsLoggedIn(true);
        setUser({
          name: displayName,
          email: session.user.email || "",
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  if (initializing) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg animate-pulse">
            T
          </div>
          <span className="text-sm font-medium text-[var(--text)]">Loading workspace...</span>
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
