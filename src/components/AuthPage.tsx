import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AnimatedThemeToggler } from "./ui/AnimatedThemeToggler";

interface AuthPageProps {
  initialMode?: "login" | "signup";
  onLoginSuccess: (user: { name: string; email: string }) => void;
  onGoToLanding: () => void;
}

export function AuthPage({
  initialMode = "login",
  onLoginSuccess,
  onGoToLanding,
}: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup") {
      if (!username.trim()) {
        setError("Please enter a username.");
        return;
      }

      if (!isSupabaseConfigured) {
        setError(
          "Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in tagger-frontend/.env"
        );
        return;
      }

      setLoading(true);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          // If session exists, email confirmation is disabled and user is logged in
          onLoginSuccess({
            name: username.trim() || email.trim().split("@")[0] || "User",
            email: email.trim(),
          });
        } else {
          // Email confirmation is required by Supabase settings
          setSuccess("Account created successfully! Please check your email to confirm your registration.");
          setEmail("");
          setPassword("");
          setUsername("");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred during sign up.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!isSupabaseConfigured) {
        setError(
          "Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in tagger-frontend/.env"
        );
        return;
      }

      setLoading(true);
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else if (data.user) {
          const userMetadata = data.user.user_metadata || {};
          const displayName =
            userMetadata.username ||
            userMetadata.name ||
            email.trim().split("@")[0] ||
            "User";

          onLoginSuccess({
            name: displayName,
            email: data.user.email || email.trim(),
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred during sign in.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[var(--primary)]/10 via-[var(--accent)]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="size-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="font-bold text-xl text-[var(--text-h)] tracking-tight">
            Tagger
          </span>
        </button>

        <div className="flex items-center gap-4">
          <AnimatedThemeToggler variant="circle" duration={500} />
          <button
            onClick={onGoToLanding}
            className="text-xs font-semibold text-[var(--text)] hover:text-[var(--text-h)] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>← Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-[var(--code-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
          {/* Top Decorative Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]" />

          {/* Mode Switcher Tabs (Sign In / Sign Up) */}
          <div className="flex p-1 bg-[var(--bg)] border border-[var(--border)] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[var(--code-bg)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)] opacity-80"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-[var(--code-bg)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--text)] hover:text-[var(--text-h)] opacity-80"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Header Title */}
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-extrabold text-[var(--text-h)] tracking-tight">
              {mode === "login" ? "Welcome back" : "Get started with Tagger"}
            </h1>
            <p className="text-xs text-[var(--text)] opacity-80">
              {mode === "login"
                ? "Enter your credentials to access your bookmark workspace."
                : "Organize all your web links, tags & collections effortlessly."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text)]">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-gray-400 dark:placeholder-gray-500 focus:placeholder-transparent outline-none focus:border-[var(--primary)] transition-colors leading-normal disabled:opacity-50"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text)]">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-gray-400 dark:placeholder-gray-500 focus:placeholder-transparent outline-none focus:border-[var(--primary)] transition-colors leading-normal disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text)]">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to email.")}
                    className="text-[11px] font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 pr-10 text-base sm:text-xs rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-gray-400 dark:placeholder-gray-500 focus:placeholder-transparent outline-none focus:border-[var(--primary)] transition-colors leading-normal disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-70 hover:opacity-100 cursor-pointer text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 shadow-lg shadow-[var(--primary)]/20 transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : mode === "login" ? (
                "Sign In to Tagger"
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          {/* Bottom Footer Note */}
          <div className="pt-2 text-center text-[11px] text-[var(--text)] opacity-70">
            {mode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-bold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  Sign up for free
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-bold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[var(--text)] opacity-60">
        © {new Date().getFullYear()} Tagger Inc. All rights reserved.
      </footer>
    </div>
  );
}

