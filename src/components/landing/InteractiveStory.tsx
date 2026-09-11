import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  Terminal,
  Volume2,
} from "lucide-react";

interface StoryPillar {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
}

const pillars: StoryPillar[] = [
  {
    number: "01",
    badge: "Core Automation & Vision",
    title: "AI Auto-Tagging & Visual Context",
    subtitle: "Zero Effort, Instant Classification",
    description:
      "Save links, screenshots, and visual assets without manual sorting. Mindspace applies intelligent AI auto-tagging and deep visual context understanding, reading text and concepts from your images as well.",
    bullets: [
      "Hands-off automatic classification for every bookmark and save.",
      "Instant AI auto-tagging for all saved content and web bookmarks.",
      "Deep visual context understanding that reads your images as well.",
    ],
  },
  {
    number: "02",
    badge: "Model Context Provider",
    title: "Model Context Provider (MCP)",
    subtitle: "Direct Context Injection for Frontier AI Models",
    description:
      "Mindspace operates as a native Model Context Provider. Connect your entire library of bookmarks, images, and notes directly to Claude, ChatGPT and other AI models.",
    bullets: [
      "Native Model Context Provider protocol endpoint.",
      "Allows frontier AI models to read, query, and cite your private research.",
      "Seamless integration with Claude, ChatGPT and other AI models.",
    ],
  },
  {
    number: "03",
    badge: "Knowledge Retrieval",
    title: "RAG System Chatbot",
    subtitle: "Query Across All Your Bookmarks & Knowledge",
    description:
      "An intelligent RAG chatbot that searches across your entire bookmark vault, saved articles, images, and audio transcripts to deliver precise, citation-backed answers to your queries.",
    bullets: [
      "Conversational RAG chatbot indexing all your bookmarks, notes, and saves.",
      "Answers complex queries with direct syntheses and source citations.",
      "Deep transcript search across your saved YouTube podcasts and videos.",
    ],
  },
];

export function InteractiveStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const lastIndexRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      // Scrolled distance from the moment the container top reaches top of viewport
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

      let index = 0;
      if (progress < 0.33) {
        index = 0;
      } else if (progress < 0.67) {
        index = 1;
      } else {
        index = 2;
      }

      if (index !== lastIndexRef.current) {
        setDirection(index > lastIndexRef.current ? 1 : -1);
        lastIndexRef.current = index;
        setActiveIndex(index);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToStep = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const totalScrollable = rect.height - window.innerHeight;
    const targetProgress = index === 0 ? 0.05 : index === 1 ? 0.5 : 0.95;
    const targetScroll = containerTop + targetProgress * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="relative scroll-mt-16">
      {/* Section Header */}
      <div className="pt-20 pb-8 px-6 max-w-4xl mx-auto text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Built for minds that consume at frontier speed.
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-normal max-w-2xl mx-auto">
          From AI auto-tagging and reading your images to Model Context Provider access and a conversational RAG chatbot across all your bookmarks.
        </p>
      </div>

      {/* Full-Page Interactive Scrolling Track: 200vh for tight, responsive, no-lag scrolling */}
      <div ref={containerRef} className="relative h-[200vh]">
        {/* Pinned Sticky Viewport */}
        <div
          className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden py-8 px-6 sm:px-12 lg:px-20 z-10"
          style={{ position: "sticky", top: 0 }}
        >
          {/* Architectural background grid pattern */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Narrative Content with Fade and Slide Animation */}
            <div className="lg:col-span-5 space-y-6">
              {/* Progress indicator dashes (matching 21st.dev scrollytelling component) */}
              <div className="flex items-center gap-2">
                {pillars.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === activeIndex
                      ? "w-10 bg-amber-600 dark:bg-amber-400"
                      : "w-4 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600"
                      }`}
                    aria-label={`Jump to step ${i + 1}`}
                  />
                ))}
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 ml-2">
                  0{activeIndex + 1} / 0{pillars.length}
                </span>
              </div>

              {/* Animated Text Content */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={{
                    initial: (dir: number) => ({
                      opacity: 0,
                      y: dir > 0 ? 28 : -28,
                    }),
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                    exit: (dir: number) => ({
                      opacity: 0,
                      y: dir > 0 ? -28 : 28,
                      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                    }),
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                      {pillars[activeIndex].number} — {pillars[activeIndex].badge}
                    </span>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
                      {pillars[activeIndex].title}
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed pt-1">
                      {pillars[activeIndex].description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {pillars[activeIndex].bullets.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300"
                      >
                        <CheckCircle2 className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2 text-xs font-mono text-neutral-400">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Scroll to advance story</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Sliding Showcase Device Frame */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl p-3 sm:p-5 bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl backdrop-blur-sm overflow-hidden min-h-[400px] flex items-center justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={{
                      initial: (dir: number) => ({
                        opacity: 0,
                        y: dir > 0 ? 50 : -50,
                        scale: 0.96,
                      }),
                      animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      },
                      exit: (dir: number) => ({
                        opacity: 0,
                        y: dir > 0 ? -50 : 50,
                        scale: 0.96,
                        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                      }),
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full"
                  >
                    {activeIndex === 0 && <ShowcaseVisualEngine />}
                    {activeIndex === 1 && <ShowcaseMcpServer />}
                    {activeIndex === 2 && <ShowcaseTranscriptRag />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Interactive Showcase 01: Visual Context Engine Simulator ─── */
function ShowcaseVisualEngine() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-5"
    >
      {/* URL Input demonstration */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          Live Ingestion Stream
        </label>
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-700 dark:text-neutral-300 truncate">
            https://youtube.com/watch?v=Amodei-Scaling-Laws-2026
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            200 OK
          </span>
        </div>
      </div>

      {/* Auto-extracted metadata & Vision OCR Preview */}
      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Autonomously Extracted Metadata
          </span>
          <span className="text-[10px] font-mono text-neutral-400">Duration 142m · 24fps</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[10px]">Title & Entities</span>
            <div className="font-medium text-neutral-800 dark:text-neutral-200">
              Dario Amodei, Anthropic, Scaling Limits
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[10px]">Vector Density</span>
            <div className="font-medium text-emerald-600 dark:text-emerald-400">
              1,536-dim Embedding Generated
            </div>
          </div>
        </div>

        {/* Auto tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
            #synthetic-reasoning
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium">
            #compute-clusters
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium">
            #epistemic-depth
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Interactive Showcase 02: MCP Integration Inspector ─── */
function ShowcaseMcpServer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl bg-neutral-950 text-neutral-200 border border-neutral-800 shadow-xl space-y-4 font-mono text-xs"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-neutral-400">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-amber-500" />
          <span>mcp-server-mindspace.local:8080</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
          Connected to Claude
        </span>
      </div>

      {/* JSON-RPC Request & Response snippet */}
      <div className="space-y-2 text-[11px] leading-relaxed">
        <div className="text-neutral-500">// 1. Claude calls Mindspace MCP tool</div>
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 overflow-x-auto">
          {`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_saved_knowledge",
    "arguments": {
      "query": "transformer attention formula from research paper",
      "limit": 1
    }
  }
}`}
        </div>

        <div className="text-neutral-500 pt-1">// 2. Mindspace responds with verified source</div>
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-300 overflow-x-auto">
          {`{
  "match": "Attention Is All You Need (Vaswani et al.)",
  "formula": "softmax(QK^T / sqrt(d_k)) * V",
  "confidence": 0.994,
  "mcp_url": "mindspace://item/arxiv-1706.03762"
}`}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Interactive Showcase 03: Transcript RAG Chatbot Simulator ─── */
function ShowcaseTranscriptRag() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4 text-xs"
    >
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-amber-600" />
          <span className="font-bold text-neutral-900 dark:text-neutral-100 font-sans">
            Mindspace Conversational RAG
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">Model: Gemini 2.5 Pro</span>
      </div>

      {/* User Question */}
      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
        <div className="text-[10px] font-mono text-neutral-400 mb-1">You asked:</div>
        <div className="font-medium">
          "What did Dario Amodei specify about high-order synthetic data bottlenecks?"
        </div>
      </div>

      {/* AI Answer with Clickable Timestamp */}
      <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
          <Sparkles className="size-3.5 text-amber-600" /> Sourced from your saved podcast
        </div>

        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[11px]">
          "Dario highlighted that synthetic data isn't a silver bullet unless verified with rigorous epistemic checkers. Model drift occurs rapidly if recursive outputs aren't grounded in empirical tests."
        </p>

        {/* Timestamp Jump Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-mono text-[11px] shadow-sm hover:bg-amber-700 transition-colors cursor-pointer">
          <Volume2 className="size-3.5" />
          <span>Jump to 42:15 in Podcast Transcript</span>
        </div>
      </div>
    </motion.div>
  );
}
