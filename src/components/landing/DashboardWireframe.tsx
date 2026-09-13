import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Glass } from "@samasante/liquid-glass";
import {
  Sparkles,
  RotateCcw,
  Check,
  Cpu,
  Plus,
  Globe,
  Trash2,
  Copy,
  Sun,
} from "lucide-react";
import {
  XBrandLogo,
  YouTubeBrandLogo,
  InstagramBrandLogo,
  LinkedInBrandLogo,
  RedditAlienLogo,
  VerticalMoreIcon,
} from "../SocialCards/SocialCardIcons";

/* ══════════════════════════════════════════════════════════════════
   Wireframe Cards Schema & Definitions (Pure Divs, Zero Text Data)
══════════════════════════════════════════════════════════════════ */
export interface WireframeCardItem {
  id: string;
  type: "x" | "youtube" | "instagram" | "linkedin" | "reddit" | "generic";
  platformName: string;
}

const INITIAL_WIREFRAME_CARDS: WireframeCardItem[] = [
  { id: "wf-x-1", type: "x", platformName: "Twitter / X" },
  { id: "wf-yt-1", type: "youtube", platformName: "YouTube" },
  { id: "wf-ig-1", type: "instagram", platformName: "Instagram" },
  { id: "wf-li-1", type: "linkedin", platformName: "LinkedIn" },
  { id: "wf-rd-1", type: "reddit", platformName: "Reddit" },
  { id: "wf-web-1", type: "generic", platformName: "Web Article" },
];

export const DEMO_PLATFORM_TABS = [
  { id: "all", label: "All" },
  { id: "x", label: "Twitter / X" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "reddit", label: "Reddit" },
  { id: "generic", label: "Articles" },
];

interface Toast {
  id: string;
  message: string;
}

/* ══════════════════════════════════════════════════════════════════
   Platform Icon Renderer Helper (Pure Logos, Transparent YouTube)
══════════════════════════════════════════════════════════════════ */
function PlatformLogo({ type }: { type: WireframeCardItem["type"] }) {
  switch (type) {
    case "x":
      return <XBrandLogo className="w-4 h-4 fill-slate-900 dark:fill-white shrink-0" />;
    case "youtube":
      return <YouTubeBrandLogo className="w-5 h-5 shrink-0" />;
    case "instagram":
      return <InstagramBrandLogo className="w-4 h-4 shrink-0" />;
    case "linkedin":
      return <LinkedInBrandLogo className="w-4 h-4 fill-[#0a66c2] shrink-0" />;
    case "reddit":
      return <RedditAlienLogo className="w-4 h-4 fill-[#FF4500] shrink-0" />;
    default:
      return <Globe className="w-4 h-4 text-[#B5814C] dark:text-[#D99F50] shrink-0" />;
  }
}

/* ══════════════════════════════════════════════════════════════════
   Authentic Liquid Glass Wireframe AI Context Modal
   (Mirrors real AiContextModal optics, Swiss colors, hierarchy & zero text)
══════════════════════════════════════════════════════════════════ */
function WireframeAiModal({
  card,
  onClose,
}: {
  card: WireframeCardItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!card) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/25 dark:bg-black/45 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <Glass
        className="rounded-[2rem] max-w-xl w-full flex flex-col max-h-[86vh] animate-in zoom-in-95 duration-200 text-left relative shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-300"
        style={{
          display: "flex",
        }}
        onClick={(e) => e.stopPropagation()}
        optics={{
          mapSize: 256,
          clipToShape: true,
          softEdge: true,
          depth: 0.95,
          curvature: 0.52,
          dispersion: 0.65,
          strength: 0.22,
          bend: 0.75,
          bendWidth: 0.12,
          frost: 5.5,
          brightness: 0,
          specular: 1.95,
          sheenAngle: 50,
          sheen: 1.3,
          sheenWidth: 3.5,
          glow: 0.25,
        }}
      >
        <div className="p-6 sm:p-8 flex flex-col h-full max-h-[86vh] overflow-hidden">
          {/* Header: Platform Brand, Subtitle & Circular Dismiss (Matching AiContextModal) */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-500/20 shrink-0">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-white/15 dark:bg-white/10 text-[var(--text-h)] border border-white/20 dark:border-white/10 flex items-center gap-1.5">
                  <PlatformLogo type={card.type} />
                  <span>{card.platformName}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)] opacity-60">
                  AI Intelligence
                </span>
              </div>
              {/* Skeleton Title Bar */}
              <div className="space-y-1 mt-1.5">
                <div className="h-5 w-4/5 rounded-md bg-[var(--text-h)]/15 dark:bg-white/20" />
                <div className="h-4.5 w-1/2 rounded-md bg-[var(--text-h)]/15 dark:bg-white/20" />
              </div>
              {/* Skeleton URL Bar */}
              <div className="h-3 w-36 rounded bg-[var(--text)]/20 dark:bg-white/15 font-mono mt-1" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="size-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text)] hover:text-[var(--text-h)] transition-colors cursor-pointer shrink-0 mt-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body: Structured Swiss Hierarchy with zero text data (No scrollbar) */}
          <div className="space-y-5 overflow-y-auto no-scrollbar pr-1 py-4 flex-1">
            {/* Section 1: Context Synthesis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70">
                  Context Synthesis
                </span>
                <span className="flex items-center gap-1 opacity-70 text-[11px] font-medium text-[var(--text)] hover:text-[var(--text-h)] transition-colors cursor-pointer">
                  <Copy className="size-3" />
                  <span>Copy</span>
                </span>
              </div>

              <div className="rounded-2xl p-4 sm:p-5 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 space-y-2.5">
                <div className="h-3.5 w-full rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                <div className="h-3.5 w-11/12 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                <div className="h-3.5 w-3/4 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
              </div>
            </div>

            {/* Section 2: AI Categories (Emerald styling matching real AiContextModal) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                AI Categories (2)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-500/20 capitalize tracking-tight flex items-center">
                  <span className="h-2.5 w-16 rounded-full bg-emerald-500/40 dark:bg-emerald-400/40" />
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-500/20 capitalize tracking-tight flex items-center">
                  <span className="h-2.5 w-20 rounded-full bg-emerald-500/40 dark:bg-emerald-400/40" />
                </span>
              </div>
            </div>

            {/* Section 3: Auto-Generated Tags */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                Auto-Generated Tags (3)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 flex items-center gap-1">
                  <span className="opacity-50">#</span>
                  <span className="h-2.5 w-14 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 flex items-center gap-1">
                  <span className="opacity-50">#</span>
                  <span className="h-2.5 w-18 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 flex items-center gap-1">
                  <span className="opacity-50">#</span>
                  <span className="h-2.5 w-12 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                </span>
              </div>
            </div>

            {/* Section 4: Visual Entities */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                Visual Entities (2)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 flex items-center">
                  <span className="h-2.5 w-24 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 flex items-center">
                  <span className="h-2.5 w-20 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20" />
                </span>
              </div>
            </div>

            {/* Section 5: Detected Media Text (OCR) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                Detected Media Text (OCR)
              </span>
              <div className="rounded-2xl p-3.5 sm:p-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 space-y-2">
                <div className="h-3 w-4/5 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20 font-mono" />
                <div className="h-3 w-3/5 rounded-full bg-[var(--text-h)]/15 dark:bg-white/20 font-mono" />
              </div>
            </div>
          </div>

          {/* Footer: Swiss Minimalist Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-500/20 shrink-0">
            <div className="text-xs font-semibold text-[var(--text)] opacity-60 flex items-center gap-1.5">
              <span>Visit Source</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-3.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-xs font-bold rounded-full bg-[var(--text-h)] text-[var(--bg)] dark:bg-white dark:text-black hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </Glass>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Self-Contained Div Wireframe Card (Only Logos & Clickable 3-Dots)
══════════════════════════════════════════════════════════════════ */
function WireframeCard({
  item,
  isMenuOpen,
  onToggleMenu,
  onOpenAiContext,
  onDelete,
}: {
  item: WireframeCardItem;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onOpenAiContext: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-[#14110E] border border-[#EBE5DC] dark:border-[#26211C] p-4 shadow-sm flex flex-col justify-between">
      {/* ─── Card Header: Avatar skeleton, handle skeleton, Platform Logo, and 3-dots ─── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Skeleton Avatar */}
          <div className="size-7 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
          {/* Skeleton Author & Handle */}
          <div className="space-y-1 min-w-0">
            <div className="h-3 w-20 rounded bg-neutral-300 dark:bg-neutral-700" />
            <div className="h-2 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Right Header: Logo & 3-Dots Action */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          <PlatformLogo type={item.type} />

          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="Actions"
            className="p-1 rounded-md text-[#8C8377] hover:text-[#211D1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <VerticalMoreIcon className="size-4 fill-current" />
          </button>

          {/* 3-Dots Action Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-[#FAF8F5] dark:bg-[#1C1814] border border-[#EBE5DC] dark:border-[#2F2923] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAiContext();
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-[#211D1A] dark:text-[#FAF8F5] hover:bg-[#B5814C]/10 dark:hover:bg-[#B5814C]/20 hover:text-[#B5814C] dark:hover:text-[#D99F50] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="size-3.5 text-[#B5814C] dark:text-[#D99F50]" />
                <span>AI Context</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Card Media Area (Pure Wireframe Placeholder Div, No Images) ─── */}
      {item.type === "youtube" ? (
        <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200/60 dark:from-neutral-800 dark:via-neutral-800/50 dark:to-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 mb-3 flex items-center justify-center relative overflow-hidden">
          {/* Subtle YouTube Center Play Badge */}
          <div className="w-10 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
          </div>
          <div className="absolute bottom-2 right-2 h-3.5 w-8 rounded bg-black/60" />
        </div>
      ) : item.type === "instagram" ? (
        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200/60 dark:from-neutral-800 dark:via-neutral-800/50 dark:to-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 mb-3 flex items-center justify-center relative overflow-hidden">
          {/* Carousel Dot Indicators */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-white shadow-xs" />
            <div className="size-1.5 rounded-full bg-white/50" />
            <div className="size-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      ) : item.type === "x" ? (
        <div className="w-full h-28 rounded-xl bg-gradient-to-br from-neutral-200/80 via-neutral-100 to-neutral-200/50 dark:from-neutral-800/80 dark:via-neutral-800/40 dark:to-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 mb-3" />
      ) : item.type === "linkedin" ? (
        <div className="w-full h-24 rounded-xl bg-gradient-to-br from-neutral-200/80 via-neutral-100 to-neutral-200/50 dark:from-neutral-800/80 dark:via-neutral-800/40 dark:to-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 mb-3" />
      ) : (
        <div className="w-full h-20 rounded-xl bg-gradient-to-br from-neutral-200/80 via-neutral-100 to-neutral-200/50 dark:from-neutral-800/80 dark:via-neutral-800/40 dark:to-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 mb-3" />
      )}

      {/* ─── Card Text Lines (Pure Div Skeleton Bars, Zero Text Content) ─── */}
      <div className="space-y-2 mb-3">
        <div className="h-3 w-full rounded bg-neutral-300 dark:bg-neutral-700" />
        <div className="h-3 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-4/6 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* ─── Card Footer / Metrics Skeletons ─── */}
      <div className="pt-2 border-t border-[#EBE5DC]/60 dark:border-[#26211C]/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-2 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-4 w-12 rounded-full bg-amber-500/10 border border-amber-500/20" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main Dashboard Wireframe Container (Fixed Constant Height Canvas)
══════════════════════════════════════════════════════════════════ */
export function DashboardWireframe() {
  const [cards, setCards] = useState<WireframeCardItem[]>(INITIAL_WIREFRAME_CARDS);
  const [activePlatform, setActivePlatform] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedAiCard, setSelectedAiCard] = useState<WireframeCardItem | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Toast notification dispatcher
  const addToast = useCallback((message: string) => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  // Filter wireframe cards by active tab and search query
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (activePlatform !== "all" && card.type !== activePlatform) return false;
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        return card.platformName.toLowerCase().includes(q) || card.type.includes(q);
      }
      return true;
    });
  }, [cards, activePlatform, searchInput]);

  // Platform count stats
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length };
    cards.forEach((c) => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // Partition cards into 3 columns (matching lg desktop screen layout)
  const columns = useMemo(() => {
    const cols: WireframeCardItem[][] = [[], [], []];
    filteredCards.forEach((c, idx) => {
      cols[idx % 3].push(c);
    });
    return cols;
  }, [filteredCards]);

  // BASE_DESKTOP_WIDTH matching lg screen (1024px)
  const BASE_WIDTH = 1024;
  const LOCKED_HEIGHT = 860;

  // Scale down proportionally on mobile so wireframe displays what is seen on lg desktop screens
  useLayoutEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const availableWidth = wrapperRef.current.clientWidth;
      if (availableWidth > 0 && availableWidth < BASE_WIDTH) {
        setScale(availableWidth / BASE_WIDTH);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleResetDemo = () => {
    setCards(INITIAL_WIREFRAME_CARDS);
    setActivePlatform("all");
    setSearchInput("");
    addToast("Wireframe refreshed");
  };

  return (
    <div ref={wrapperRef} className="w-full relative">
      {/* Scaled Wireframe Desktop Container (Displays lg screen presentation on all devices) */}
      <div
        className="w-full overflow-hidden"
        style={{
          height: scale < 1 ? `${Math.round(LOCKED_HEIGHT * scale)}px` : `${LOCKED_HEIGHT}px`,
        }}
      >
        <div
          ref={rootRef}
          style={{
            width: scale < 1 ? `${BASE_WIDTH}px` : "100%",
            height: `${LOCKED_HEIGHT}px`,
            transform: scale < 1 ? `scale(${scale})` : "none",
            transformOrigin: "top left",
          }}
          className="w-full bg-[#FAF8F5] dark:bg-[#0B0907] text-[#211D1A] dark:text-[#FAF8F5] flex flex-col relative overflow-hidden select-none transition-colors duration-200 font-sans"
          onClick={() => setOpenMenuId(null)}
        >
          {/* ─── Ambient Organic Sand Dune Glow Meshes ─── */}
          <div
            className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-[18%] right-[-5%] w-[45vw] h-[45vh] rounded-full bg-gradient-to-bl from-[#DEAC62]/18 via-[#B5814C]/10 to-transparent dark:from-[#C88E3E]/12 dark:via-[#B5814C]/5 dark:to-transparent blur-3xl" />
            <div className="absolute top-[35%] -left-[12%] w-[45vw] h-[45vh] rounded-full bg-gradient-to-tr from-[#D99F50]/14 via-[#996533]/8 to-transparent dark:from-[#B5814C]/8 dark:via-[#996533]/4 dark:to-transparent blur-3xl" />
          </div>

          {/* ─── 1. Window Chrome Header ─── */}
          <div className="h-10 shrink-0 bg-[#FAF8F5]/90 dark:bg-[#14110E]/90 border-b border-[#EBE5DC] dark:border-[#26211C] px-4 flex items-center justify-between gap-4 z-20">
            {/* macOS Window Dots */}
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#FF5F56]/80" />
              <div className="size-2.5 rounded-full bg-[#FFBD2E]/80" />
              <div className="size-2.5 rounded-full bg-[#27C93F]/80" />
            </div>

            {/* Mock URL Pill Bar */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/90 dark:bg-[#1C1814]/90 rounded-full border border-[#EBE5DC] dark:border-[#2F2923] text-[11px] font-mono text-[#5F5850] dark:text-[#A89F91] shadow-xs">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[#211D1A] dark:text-neutral-200">
                mindspace/app
              </span>
              <span className="text-[#8C8377] text-[10px] hidden sm:inline">wireframe preview</span>
            </div>

            {/* Right Status Indicator & Reset Button */}
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetDemo();
                }}
                title="Reset wireframe data"
                className="flex items-center gap-1 text-[#8C8377] hover:text-[#B5814C] transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
              >
                <RotateCcw className="size-3" />
                <span className="hidden sm:inline text-[10px]">Reset</span>
              </button>
              <div className="flex items-center gap-1 text-[#B5814C] dark:text-[#D99F50] font-medium text-[11px]">
                <Cpu className="size-3.5" />
                <span className="hidden sm:inline">MCP Online</span>
              </div>
            </div>
          </div>

          {/* ─── 2. Top App Navigation Bar (Mirroring nav.tsx) ─── */}
          <header className="shrink-0 w-full z-20 bg-[#FAF8F5]/90 dark:bg-[#0B0907]/90 border-b border-[#EBE5DC]/80 dark:border-[#26211C]/80 px-4 sm:px-6 py-2.5 transition-colors">
            <div className="w-full flex items-center justify-between gap-4">
              {/* Search "Search my mind..." input */}
              <div className="flex-1 min-w-0">
                <div className="relative flex items-center border-b border-[#B5814C]/30 dark:border-[#C88E3E]/30 focus-within:border-[#B5814C] dark:focus-within:border-[#C88E3E] transition-colors pb-1 group w-full">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search my mind..."
                    className="w-full bg-transparent outline-none text-sm sm:text-base md:text-lg text-[#211D1A] dark:text-[#FAF8F5] placeholder-[#8C8377]/70 dark:placeholder-[#7E7569]/70 pr-6"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      aria-label="Clear search"
                      className="absolute right-0 text-[#8C8377] hover:text-[#211D1A] dark:hover:text-white cursor-pointer p-1 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Right Section: Static Theme Icon, Notifications, Profile Icon */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Static theme icon (non-interactive in demo) */}
                <div
                  className="size-8 sm:size-9 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#211D1A] dark:text-[#FAF8F5] opacity-80"
                  title="Theme"
                >
                  <Sun className="size-4" />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToast("All wireframe cards synced & vector indexed.");
                  }}
                  title="Notifications"
                  className="relative size-8 sm:size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all text-[#211D1A] dark:text-[#FAF8F5]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="size-4 text-[#211D1A] dark:text-[#FAF8F5]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#D99F50] ring-2 ring-[#FAF8F5] dark:ring-[#0B0907]" />
                </button>

                <div
                  className="size-8 sm:size-9 rounded-full bg-gradient-to-tr from-[#B5814C] to-[#996533] text-[#FAF8F5] flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
                  title="Account"
                >
                  M
                </div>
              </div>
            </div>
          </header>

          {/* ─── 3. Platform Filters & Add Bookmark Controls Bar ─── */}
          <div className="shrink-0 px-4 sm:px-6 pt-2.5 pb-2.5 border-b border-[#EBE5DC]/50 dark:border-[#26211C]/50 flex flex-wrap items-center justify-between gap-2 z-10 bg-[#FAF8F5]/80 dark:bg-[#0B0907]/80">
            {/* Horizontal Platform Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              {DEMO_PLATFORM_TABS.map((tab) => {
                const isActive = activePlatform === tab.id;
                const count = platformCounts[tab.id] ?? 0;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePlatform(tab.id);
                    }}
                    className={`group relative px-3 py-1 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
                      isActive
                        ? "bg-gradient-to-r from-[#B5814C] to-[#996533] text-[#FAF8F5] shadow-[0_2px_10px_rgba(181,129,76,0.3)] scale-100"
                        : "bg-[#FAF8F5]/80 dark:bg-[#14110E]/80 text-[#5F5850] dark:text-[#A89F91] border border-[#B5814C]/15 dark:border-[#C88E3E]/15 hover:border-[#B5814C]/35 hover:text-[#211D1A] dark:hover:text-[#FAF8F5] hover:bg-[#B5814C]/10 active:scale-95"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-black/5 dark:bg-white/10 text-[#8C8377] dark:text-[#A89F91] group-hover:bg-[#B5814C]/20 group-hover:text-[#B5814C]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Primary Action: Add Bookmark Button (Static display only, no function) */}
            <button
              type="button"
              className="relative px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#FAF8F5] bg-gradient-to-r from-[#B5814C] to-[#996533] shadow-[0_2px_10px_rgba(181,129,76,0.25)] flex items-center gap-1.5 shrink-0 opacity-90 cursor-default"
            >
              <Plus className="size-3.5" />
              <span>Add Bookmark</span>
            </button>
          </div>

          {/* ─── 4. Wireframe Cards Canvas (Constant Height: Never Shifts or Shrinks) ─── */}
          <div className="w-full flex-1 px-4 sm:px-6 py-4 relative z-0 flex flex-col overflow-y-auto no-scrollbar">
            {filteredCards.length > 0 ? (
              <div
                className="w-full grid gap-4 items-start"
                style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
              >
                {columns.map((colCards, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-4">
                    {colCards.map((card) => (
                      <WireframeCard
                        key={card.id}
                        item={card}
                        isMenuOpen={openMenuId === card.id}
                        onToggleMenu={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === card.id ? null : card.id));
                        }}
                        onOpenAiContext={() => {
                          setSelectedAiCard(card);
                          setOpenMenuId(null);
                        }}
                        onDelete={() => {
                          setCards((prev) => prev.filter((c) => c.id !== card.id));
                          setOpenMenuId(null);
                          addToast("Card removed from wireframe");
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center space-y-3 p-6 text-[#5F5850] dark:text-[#A89F91] my-auto">
                <Sparkles className="size-8 text-[#B5814C]/60" />
                <p className="text-sm font-medium">No wireframe cards match &ldquo;{searchInput}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setActivePlatform("all");
                  }}
                  className="text-xs text-[#B5814C] hover:underline font-semibold cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Floating Toast HUD ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-sm w-auto pointer-events-none px-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto px-3.5 py-1.5 rounded-full shadow-[0_8px_24px_rgba(181,129,76,0.22)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6)] bg-[#FAF8F5]/95 dark:bg-[#14110E]/95 border border-[#B5814C]/35 dark:border-[#C88E3E]/35 flex items-center gap-2 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs font-semibold text-[#211D1A] dark:text-[#FAF8F5] whitespace-nowrap backdrop-blur-md"
          >
            <Check className="size-3.5 text-[#B5814C] dark:text-[#D99F50] shrink-0" />
            <span className="truncate">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* ─── 6. Pure Wireframe AI Context Modal ─── */}
      <WireframeAiModal
        card={selectedAiCard}
        onClose={() => setSelectedAiCard(null)}
      />
    </div>
  );
}
