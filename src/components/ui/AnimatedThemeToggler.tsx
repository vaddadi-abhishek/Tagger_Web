import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export type TransitionVariant = "circle";

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

function getThemeTransitionClipPaths(
  _variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`;
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`;
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`;
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  return [
    `circle(0% at ${point(cx, cy)})`,
    `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
  ];
}

export const AnimatedThemeToggler = ({
  className,
  duration = 500,
  variant = "circle",
  fromCenter = false,
  theme,
  onThemeChange,
  ...props
}: AnimatedThemeTogglerProps) => {
  const isControlled = theme !== undefined;
  const [internalIsDark, setInternalIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDark = isControlled ? theme === "dark" : internalIsDark;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (isControlled) return;

    const updateTheme = () => {
      setInternalIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isControlled]);

  const toggleTheme = useCallback(() => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const targetNewDarkState = !isDark;

    const applyTheme = () => {
      document.documentElement.classList.toggle("dark", targetNewDarkState);
      if (isControlled) {
        onThemeChange?.(targetNewDarkState ? "dark" : "light");
      } else {
        setInternalIsDark(targetNewDarkState);
        try {
          localStorage.setItem("theme", targetNewDarkState ? "dark" : "light");
        } catch {
          // ignore quota error
        }
      }
    };

    const cleanup = () => {
      setTimeout(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        delete document.documentElement.dataset.magicuiThemeVt;
      }, Math.max(duration, 300));
    };

    const button = buttonRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let cx: number;
    let cy: number;
    if (fromCenter || !button) {
      cx = viewportWidth / 2;
      cy = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      cx = left + width / 2;
      cy = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(cx, viewportWidth - cx),
      Math.max(cy, viewportHeight - cy)
    );

    // Fallback if View Transitions API is unsupported or reduced motion is enabled
    if (
      typeof document.startViewTransition !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme();
      cleanup();
      return;
    }

    try {
      const root = document.documentElement;
      root.dataset.magicuiThemeVt = "active";

      const clipPath = getThemeTransitionClipPaths(
        variant,
        cx,
        cy,
        maxRadius,
        viewportWidth,
        viewportHeight
      );

      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      if (transition?.ready) {
        transition.ready
          .then(() => {
            document.documentElement.animate(
              { clipPath },
              {
                duration,
                easing: "ease-in-out",
                fill: "forwards",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(() => {})
          .finally(() => {
            cleanup();
          });
      } else {
        cleanup();
      }
    } catch {
      applyTheme();
      cleanup();
    }
  }, [variant, fromCenter, duration, isDark, isControlled, onThemeChange]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={cn(
        "p-2 rounded-full text-[var(--text-h)] bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--primary)] transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-label="Toggle Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      {...props}
    >
      {isDark ? (
        /* Sun Icon for Light Mode */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="size-5 text-[var(--accent)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.356-6.364l-1.591 1.591M6.758 17.242l-1.591 1.591m12.728 0l-1.591-1.591M6.758 6.758L5.167 5.167M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 0 00-7.5z"
          />
        </svg>
      ) : (
        /* Moon Icon for Dark Mode */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="size-5 text-[var(--primary)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
