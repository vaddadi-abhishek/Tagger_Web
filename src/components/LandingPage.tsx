import { useState, useEffect } from "react";
import Lenis from "lenis";
import { SandDunesCanvas } from "./landing/SandDunesCanvas";
import { ContainerScroll } from "./landing/ContainerScroll";
import { DashboardWireframe } from "./landing/DashboardWireframe";
import { InteractiveStory } from "./landing/InteractiveStory";
import { PricingSection } from "./landing/PricingSection";
import { FaqSection } from "./landing/FaqSection";
import { AnimatedThemeToggler } from "./ui/AnimatedThemeToggler";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

interface LandingPageProps {
  isLoggedIn: boolean;
  user?: { name: string; email: string } | null;
  onNavigateToAuth: (mode: "login" | "signup") => void;
  onOpenApp: () => void;
}

export function LandingPage({
  isLoggedIn,
  onNavigateToAuth,
  onOpenApp,
}: LandingPageProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [navVisible, setNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize Lenis Smooth Scrolling & Auto-hiding Navbar on Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Expose lenis instance globally for interactive showcase boundary passthrough scrolling
    window.__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    let lastScrollY = window.scrollY;

    const handleScroll = (currentScroll: number) => {
      const diff = currentScroll - lastScrollY;

      if (currentScroll <= 30) {
        setNavVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        if (diff > 8) {
          // Scrolling down: pop away / slide off screen
          setNavVisible(false);
        } else if (diff < -8) {
          // Scrolling up: pop out from top
          setNavVisible(true);
        }
      }

      lastScrollY = currentScroll;
    };

    // Listen to Lenis smooth scroll
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onLenisScroll = (e: any) => {
      handleScroll(e.scroll ?? window.scrollY);
    };

    lenis.on("scroll", onLenisScroll);

    // Fallback native scroll listener for mobile/touch or external jumps
    const onNativeScroll = () => {
      handleScroll(window.scrollY);
    };
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onLenisScroll);
      window.removeEventListener("scroll", onNativeScroll);
      delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  // Listen for theme mutations
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0907] text-[#211D1A] dark:text-[#FAF8F5] font-sans selection:bg-amber-500/20 selection:text-amber-900 transition-colors duration-1000 ease-in-out relative overflow-x-clip">
      {/* ══════════════════════════════════════════════════════════════
          1. FLOATING NAVIGATION BAR (Pill Header with Pop-in / Pop-out Physics)
      ══════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl origin-top transition-all ${navVisible
          ? "translate-y-0 scale-100 opacity-100 pointer-events-auto duration-350 ease-[cubic-bezier(0.34,1.45,0.64,1)]"
          : "-translate-y-20 scale-90 opacity-0 pointer-events-none duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
          }`}
      >
        <nav
          className={`backdrop-blur-md bg-[#FAF8F5]/85 dark:bg-neutral-900/80 border border-[#EBE5DC] dark:border-neutral-800/80 rounded-full px-5 py-2.5 flex items-center justify-between transition-all duration-300 ${isScrolled
            ? "shadow-[0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] bg-[#FAF8F5]/90 dark:bg-neutral-900/90"
            : "shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
            }`}
        >
          {/* Left: Wordmark */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xl font-bold tracking-tight text-[#211D1A] dark:text-white font-sans lowercase">
              mindspace
            </span>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium text-[#5F5850] dark:text-neutral-300">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[#211D1A] dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#211D1A] dark:hover:text-white transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="hover:text-[#211D1A] dark:hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-[#211D1A] dark:hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>

          {/* Right: Discreet Theme Toggle & Golden Pill CTA */}
          <div className="flex items-center gap-2">
            <AnimatedThemeToggler
              duration={1000}
              className="p-1.5 rounded-full text-[#6E665D] dark:text-neutral-300 hover:bg-[#EDE7DE] dark:hover:bg-neutral-800 transition-colors"
            />

            {isLoggedIn ? (
              <button
                onClick={onOpenApp}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#B5814C] to-[#996533] hover:from-[#C08C56] hover:to-[#A4703D] text-white text-xs sm:text-sm font-medium shadow-[0_2px_12px_rgba(168,110,50,0.22)] transition-all cursor-pointer"
              >
                Go to App
              </button>
            ) : (
              <button
                onClick={() => onNavigateToAuth("signup")}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#B5814C] to-[#996533] hover:from-[#C08C56] hover:to-[#A4703D] text-white text-xs sm:text-sm font-medium shadow-[0_2px_12px_rgba(168,110,50,0.22)] transition-all cursor-pointer"
              >
                Try Free
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. HERO SECTION (Procedural Sand Dunes Canvas + Editorial)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[130vh] pt-36 sm:pt-40 lg:pt-44 pb-28 px-6 sm:px-12 lg:px-20 flex flex-col justify-start overflow-hidden">
        {/* Background Three.js Procedural Sand Dunes WebGL Canvas */}
        <SandDunesCanvas key={isDark ? "dark-sand" : "light-sand"} isDark={isDark} />

        {/* Foreground Content: Pinned to the top-left empty space of the hero (not centered
            as a full-width block), since the dune ribbon sweeps low-left to high-right and
            leaves the upper-left quadrant clear. */}
        <div className="relative z-10 w-full flex flex-col items-start text-left pointer-events-auto">
          <div className="max-w-lg sm:max-w-xl lg:max-w-2xl text-left space-y-5 sm:space-y-6">
            {/* Big Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight text-[#211D1A] dark:text-[#FAF8F5] leading-[1.08] font-sans">
              <span>Save Anything</span>
              <br />
              <span className="relative inline-block mt-1">
                {/* Organic Golden Sand Brush Stroke Wash spanning across the entire lower phrase */}
                <span
                  className="absolute -inset-x-4 top-1 -bottom-2 -z-10 pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <svg
                    className="w-[108%] h-[120%] -ml-[4%] -mt-[3%] overflow-visible"
                    viewBox="0 0 650 90"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="sandBrushGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#DEAC62" stopOpacity="0.0" />
                        <stop offset="6%" stopColor="#D99F50" stopOpacity="0.55" />
                        <stop offset="25%" stopColor="#C88E3E" stopOpacity="0.75" />
                        <stop offset="55%" stopColor="#D99F50" stopOpacity="0.80" />
                        <stop offset="85%" stopColor="#C48834" stopOpacity="0.65" />
                        <stop offset="97%" stopColor="#DEAC62" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#DEAC62" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="brushFilter" x="-10%" y="-15%" width="120%" height="130%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.75" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
                        <feGaussianBlur stdDeviation="0.4" />
                      </filter>
                    </defs>
                    <path
                      d="M 15,48 Q 120,32 260,36 Q 420,40 635,30 Q 642,54 625,66 Q 460,74 280,68 Q 110,64 22,68 Z"
                      fill="url(#sandBrushGrad)"
                      filter="url(#brushFilter)"
                      className="opacity-95 dark:opacity-85"
                    />
                  </svg>
                </span>
                <span className="relative z-10">Never Organize Again</span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#5F5850] dark:text-[#B3ABA0] leading-relaxed font-normal">
              From tweets and reels to full articles, Mindspace understands what you save, recognizes the context, and tags it for you. No folders, no labels, no manual organizing. Find anything by what you remember, not what you named it.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. PRODUCT WIREFRAME / 3D PERSPECTIVE SHOWCASE (Container Scroll)
      ══════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 pt-16 sm:pt-24 pb-8 scroll-mt-20">
        {/* Title & Subheading scroll away naturally with page scroll */}
        <div className="max-w-4xl mx-auto text-center px-4 mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
            Everything You Save, In One Place
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mt-3">
            A space for your mind. Save anything, explore by context, and find what you need without folders, labels, or keywords.
          </p>
        </div>

        {/* 3D Perspective Showcase: zooms in closer with negative space, then zooms out */}
        <ContainerScroll>
          <DashboardWireframe />
        </ContainerScroll>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. HOW IT WORKS & CORE FEATURES (Interactive 3-Pillar Story)
      ══════════════════════════════════════════════════════════════ */}
      <InteractiveStory />

      {/* ══════════════════════════════════════════════════════════════
          5. CLEAR, TRANSPARENT PRICING (Three Tiers)
      ══════════════════════════════════════════════════════════════ */}
      <PricingSection
        onSelectTier={() => {
          if (isLoggedIn) {
            onOpenApp();
          } else {
            onNavigateToAuth("signup");
          }
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          6. FREQUENTLY ASKED QUESTIONS & MINIMAL CLOSING BANNER
      ══════════════════════════════════════════════════════════════ */}
      <FaqSection
        onStartFree={() => {
          if (isLoggedIn) {
            onOpenApp();
          } else {
            onNavigateToAuth("signup");
          }
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          7. EDITORIAL SWISS FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="w-full border-t border-neutral-200 dark:border-neutral-800/80 py-12 px-6 mt-16 bg-white/40 dark:bg-neutral-950/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white font-sans lowercase">
              mindspace
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} Mindspace Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}