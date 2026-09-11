import { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  FileText,
  Eye,
  Radio,
  Layers,
  Cpu,
} from "lucide-react";
import {
  YouTubeBrandLogo,
  XBrandLogo,
} from "../SocialCards/SocialCardIcons";

export function DashboardWireframe() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate home screen lazy-loading cards experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const filters = [
    { id: "all", label: "All Items", count: 148 },
    { id: "youtube", label: "Podcasts & Video", count: 42, icon: YouTubeBrandLogo },
    { id: "twitter", label: "X / Threads", count: 36, icon: XBrandLogo },
    { id: "papers", label: "Papers & Docs", count: 28, icon: FileText },
    { id: "vision", label: "Vision Screenshots", count: 22, icon: Eye },
  ];

  return (
    <div className="w-full bg-[#fbfbfb] dark:bg-[#0d0f14] text-neutral-900 dark:text-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/70 dark:border-neutral-800 shadow-2xl flex flex-col transition-colors duration-300 select-none">
      {/* ─── Browser Window Chrome / Header ─── */}
      <div className="h-12 bg-neutral-100/90 dark:bg-neutral-900/90 border-b border-neutral-200/60 dark:border-neutral-800/80 px-4 flex items-center justify-between gap-4">
        {/* macOS window dots */}
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-400/80" />
          <div className="size-3 rounded-full bg-amber-400/80" />
          <div className="size-3 rounded-full bg-emerald-400/80" />
        </div>

        {/* Mock URL Pill Bar: mindspace/app */}
        <div className="flex-1 max-w-sm mx-auto">
          <div className="h-7 px-3 bg-white dark:bg-neutral-800/80 rounded-full border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 shadow-xs">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">mindspace/app</span>
            <span className="text-neutral-400 text-[9px]">live session</span>
          </div>
        </div>

        {/* Right status indicator */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
          <Cpu className="size-3.5 text-amber-600" />
          <span className="hidden sm:inline">MCP Online</span>
        </div>
      </div>

      {/* ─── In-App Top Navigation Bar (matching Nav.tsx) ─── */}
      <div className="px-6 py-4 bg-white/80 dark:bg-neutral-900/60 border-b border-neutral-200/50 dark:border-neutral-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search mind... input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            readOnly
            value="Show podcast moments discussing distributed consensus and vector memory"
            className="w-full pl-9 pr-24 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 font-serif italic focus:outline-none truncate cursor-default"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
              ⌘K
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filters.map((f) => {
            const Icon = f.icon;
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {Icon && <Icon className="size-3" />}
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    active
                      ? "bg-neutral-700 dark:bg-neutral-200 text-white dark:text-neutral-900"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Mockup Dashboard Content Area with Lazy-Loading Cards ─── */}
      <div className="p-6 bg-[#fbfbfb] dark:bg-[#0c0d10] min-h-[480px]">
        {isLoading ? (
          /* Lazy loading skeleton matching ScreenSkeleton.tsx */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                  <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                </div>
                <div className="h-28 bg-neutral-200/80 dark:bg-neutral-800/80 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* High-Fidelity Social Cards Grid (reflecting YouTube, Research Paper, Twitter/X, and Vision) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: YouTube Podcast Transcript Card with Waveform */}
            <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-red-500/10 text-red-600 flex items-center justify-center">
                      <YouTubeBrandLogo className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">
                      Dwarkesh Patel
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    2:41:18
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                  Dario Amodei on Scaling Laws, Epistemic Rigor & Autonomous AI
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Key chapter transcript indexed. Deep discussion on synthetic reasoning data and computational bottleneck horizons.
                </p>

                {/* AI Audio Waveform & Key Timestamp Markers */}
                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Radio className="size-3 animate-pulse" /> Transcript Sourced
                    </span>
                    <span className="font-mono">42:15</span>
                  </div>

                  {/* Audio Waveform Bars */}
                  <div className="flex items-center gap-1 h-6 py-1">
                    {[12, 22, 16, 28, 20, 10, 24, 30, 18, 14, 26, 22, 16, 28, 24, 18, 12, 26].map(
                      (h, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 rounded-full transition-all ${
                            idx === 8 || idx === 9
                              ? "bg-amber-600 dark:bg-amber-400"
                              : "bg-amber-400/30 dark:bg-amber-400/20"
                          }`}
                          style={{ height: `${h}px` }}
                        />
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-amber-500/30 text-amber-800 dark:text-amber-200">
                      ⏱ 14:20 Scaling Horizon
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-600 text-white font-medium">
                      ⏱ 42:15 Epistemic Depth
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Sparkles className="size-3 text-amber-600" /> Full RAG Ready
                </span>
                <span className="text-[10px]">Saved 2h ago</span>
              </div>
            </div>

            {/* Card 2: Research Paper & Math Formula Card */}
            <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <FileText className="size-3.5" />
                    </div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">
                      arXiv:1706.03762
                    </span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                    PDF Indexed
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                  Attention Is All You Need — Transformer Architecture
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Seminal paper introducing scaled dot-product attention and multi-head projection tensors.
                </p>

                {/* Equation / Schematic Preview */}
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                  <div className="text-[9px] text-neutral-400 uppercase tracking-wider mb-1">
                    Auto-Extracted Formula
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 text-center font-serif italic text-amber-800 dark:text-amber-300">
                    Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    #transformer
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    #deep-learning
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ MCP Synced
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Layers className="size-3 text-blue-500" /> Vector Embedded
                </span>
                <span className="text-[10px]">Saved yesterday</span>
              </div>
            </div>

            {/* Card 3: Vision AI Screenshot / Whiteboard Card */}
            <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Eye className="size-3.5" />
                    </div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">
                      Screenshot OCR
                    </span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                    Vision AI
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                  Distributed System Diagram: Hybrid Cache + Vector Mesh
                </h4>

                {/* Visual Bounding Box Diagram Mockup */}
                <div className="h-24 rounded-xl bg-neutral-900 relative overflow-hidden flex items-center justify-center p-3 border border-neutral-700">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
                  <div className="relative z-10 w-full flex items-center justify-between gap-2 text-[10px]">
                    <div className="p-1.5 rounded bg-purple-500/20 border border-purple-400 text-purple-200 font-mono">
                      [Client UI]
                    </div>
                    <div className="h-0.5 flex-1 bg-amber-400/60 dashed" />
                    <div className="p-1.5 rounded bg-amber-500/20 border border-amber-400 text-amber-200 font-mono">
                      [MCP Layer]
                    </div>
                    <div className="h-0.5 flex-1 bg-blue-400/60" />
                    <div className="p-1.5 rounded bg-blue-500/20 border border-blue-400 text-blue-200 font-mono">
                      [Vector Store]
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-neutral-400">
                    Confidence 99.4%
                  </span>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Diagram OCR parsed. All block labels and topology relationships indexed for natural search.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  <Sparkles className="size-3" /> Auto-Tagged
                </span>
                <span className="text-[10px]">Saved 3d ago</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mockup Bottom Bar ─── */}
      <div className="px-6 py-3 bg-neutral-100/80 dark:bg-neutral-900/80 border-t border-neutral-200/50 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Database Synced</span>
          </span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
          <span className="hidden sm:inline">148 Bookmarks Indexed</span>
        </div>
        <div className="text-[11px]">Query latency 38ms</div>
      </div>
    </div>
  );
}
