import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

interface StoryPillar {
  number: string;
  badge: string;
  title: string;
  subtitle?: string;
  description: string;
  bullets: string[];
  comingSoon?: boolean;
}

const pillars: StoryPillar[] = [
  {
    number: "01",
    badge: "Automation",
    title: "AI Auto-Tagging",
    subtitle: "Hands-off automatic classification",
    description:
      "Save links, screenshots, and visual assets without manual sorting. Mindspace automatically classifies and tags everything you save, so your library organizes itself.",
    bullets: [
      "Automatically extracts topics, authors, and formats so you never have to manage folders or tags.",
      "Identifies specific people, creators, and brands instead of generic labels like “person” or “outdoor”.",
      "Creates a consistent and unified tagging system across X, Instagram, LinkedIn, Reddit, and web articles.",
    ],
  },
  {
    number: "02",
    badge: "Seeing Beyond the Surface",
    title: "Visual Context Provider",
    subtitle: "Interpreting contents and meaning",
    description:
      "Mindspace goes beyond surface-level image recognition by interpreting what’s actually in your visuals, so your saved assets are searchable by what they contain and mean.",
    bullets: [
      "Instantly reads and indexes text inside screenshots, slides, documents, and infographics.",
      "Interprets diagrams, UI components, typography, and aesthetics rather than just surface-level objects.",
      "Lets you search for what you actually remember seeing, even if you don't recall the title or author.",
    ],
  },
  {
    number: "03",
    badge: "Model Context Provider",
    title: "Model Context Protocol (MCP) Connectivity",
    subtitle: "Direct Context Injection for Frontier AI Models",
    description:
      "Connect your entire library of bookmarks, image text, visual context, and notes directly to Claude, ChatGPT, and other AI models.",
    bullets: [
      "Seamlessly integrates with Claude, ChatGPT, and other AI assistants through native MCP.",
      "Allows your AI tools to query your saved library directly without exporting or copying links.",
      "Lets frontier AI models search, read, and reference your personal knowledge in real time.",
    ],
    comingSoon: true,
  },
];

export function InteractiveStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Find the pillar whose center is closest to 45% of viewport height
      const focalPoint = window.innerHeight * 0.45;
      let closestIdx = 0;
      let minDistance = Infinity;

      pillarRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - focalPoint);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setActiveCard(closestIdx);
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
    const el = pillarRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section id="how-it-works" className="relative scroll-mt-16 py-16">
      {/* Section Header */}
      <div className="pt-8 pb-12 px-6 max-w-6xl mx-auto text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Everything You Save. Everything You Know.
        </h2>
      </div>

      {/* Sticky Scroll Reveal Track */}
      <div ref={containerRef} className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Architectural background grid pattern */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-14">
          {/* Left Column: Natural Scrolling Content (reveals on scroll) */}
          <div className="w-full lg:w-[50%]">
            {/* Pillar Sections */}
            <div className="space-y-24 lg:space-y-36 pb-32">
              {pillars.map((pillar, index) => {
                const isActive = activeCard === index;
                return (
                  <motion.div
                    key={pillar.number}
                    ref={(el) => {
                      pillarRefs.current[index] = el;
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0.28,
                    }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="space-y-6 pt-4 cursor-pointer"
                    onClick={() => scrollToStep(index)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#B5814C] dark:text-[#D99F50] font-bold">
                          {pillar.number} — {pillar.badge}
                        </span>
                        {pillar.comingSoon && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 dark:border-amber-400/20 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
                        {pillar.title}
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed pt-1">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {pillar.bullets.map((b, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300"
                        >
                          <CheckCircle2 className="size-4.5 text-[#B5814C] dark:text-[#D99F50] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mobile-only inline showcase preview */}
                    <div className="block lg:hidden pt-4">
                      <div className="rounded-3xl p-3 sm:p-5 bg-white/70 dark:bg-neutral-900/60 border border-[#EBE5DC] dark:border-[#26211C] shadow-xl backdrop-blur-sm overflow-hidden">
                        {index === 0 && <ShowcaseAutoTagging />}
                        {index === 1 && <ShowcaseVisualContext />}
                        {index === 2 && <ShowcaseMcpServer />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Showcase Box (changes right side boxes on scroll) */}
          <div className="hidden lg:block lg:w-[48%] sticky top-28 xl:top-32 self-start py-8">
            <div className="relative rounded-3xl p-3 sm:p-5 bg-white/70 dark:bg-neutral-900/60 border border-[#EBE5DC] dark:border-[#26211C] shadow-2xl backdrop-blur-sm overflow-hidden min-h-[440px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  {activeCard === 0 && <ShowcaseAutoTagging />}
                  {activeCard === 1 && <ShowcaseVisualContext />}
                  {activeCard === 2 && <ShowcaseMcpServer />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Interactive Showcase 01: AI Auto-Tagging (Mirroring Image 1) ─── */
function ShowcaseAutoTagging() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF8F5]/90 dark:bg-[#14100D]/90 border border-[#EBE5DC] dark:border-[#26211C] shadow-xl space-y-6 select-none"
    >
      {/* 1. AI Categories */}
      <div className="space-y-3">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C8377] dark:text-[#A89F91] block">
          AI CATEGORIES (4)
        </span>
        <div className="flex flex-wrap gap-2.5">
          {[
            "Career & Employment",
            "Job Hunting",
            "Professional Networking",
            "Tips & Tricks",
          ].map((cat) => (
            <span
              key={cat}
              className="px-4 py-1.5 text-xs sm:text-[13px] font-medium rounded-full bg-[#F3ECE1] dark:bg-[#201A15] text-[#2E2823] dark:text-[#FAF8F5] border border-[#DECDBB] dark:border-[#3D3328] shadow-2xs hover:border-[#B5814C]/40 transition-colors"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Auto-Generated Tags */}
      <div className="space-y-3">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C8377] dark:text-[#A89F91] block">
          AUTO-GENERATED TAGS (7)
        </span>
        <div className="flex flex-wrap gap-2.5">
          {[
            "#job-hunt",
            "#linkedin-tips",
            "#career-advice",
            "#employment",
            "#job-search",
            "#productivity",
            "#reddit",
          ].map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 text-xs sm:text-[13px] font-medium rounded-full bg-[#F3ECE1] dark:bg-[#201A15] text-[#2E2823] dark:text-[#FAF8F5] border border-[#DECDBB] dark:border-[#3D3328] shadow-2xs hover:border-[#B5814C]/40 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Visual Entities */}
      <div className="space-y-3">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C8377] dark:text-[#A89F91] block">
          VISUAL ENTITIES (1)
        </span>
        <div className="flex flex-wrap gap-2.5">
          <span className="px-4 py-1.5 text-xs sm:text-[13px] font-medium rounded-full bg-[#F3ECE1] dark:bg-[#201A15] text-[#2E2823] dark:text-[#FAF8F5] border border-[#DECDBB] dark:border-[#3D3328] shadow-2xs hover:border-[#B5814C]/40 transition-colors">
            LinkedIn
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Interactive Showcase 02: Visual Context Provider (Mirroring Image 2) ─── */
function ShowcaseVisualContext() {
  const [copied, setCopied] = useState(false);
  const synthesisText =
    "Min Choi shares a screenshot demonstrating a wild interaction with Grok Bot where he provides a photo of his credit card. The AI assistant successfully analyzes his work needs, finds the best deal for an Elgat Stream Deck, and navigates the purchase process automatically.";

  const handleCopy = () => {
    navigator.clipboard.writeText(synthesisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF8F5]/90 dark:bg-[#14100D]/90 border border-[#EBE5DC] dark:border-[#26211C] shadow-xl space-y-4"
    >
      {/* Header Row: CONTEXT SYNTHESIS & Copy */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C8377] dark:text-[#A89F91]">
          CONTEXT SYNTHESIS
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs sm:text-[13px] font-medium text-[#8C8377] dark:text-[#A89F91] hover:text-[#B5814C] dark:hover:text-[#D99F50] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <Check className="size-3.5" />
              Copied
            </span>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Synthesis Text Card Box */}
      <div className="rounded-2xl p-5 sm:p-7 bg-[#F5F0E8]/70 dark:bg-[#1C1814] border border-[#E8DFD2] dark:border-[#2C241D] shadow-2xs">
        <p className="text-sm sm:text-[14.5px] leading-relaxed sm:leading-[1.75] text-[#211D1A] dark:text-[#FAF8F5] font-normal tracking-tight">
          {synthesisText}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Interactive Showcase 03: Model Context Provider (MCP) ─── */
function ShowcaseMcpServer() {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setJoined(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EBE5DC] dark:border-[#26211C] shadow-xl bg-[#FAF8F5]/90 dark:bg-[#14100D]/90 min-h-[380px] flex items-center justify-center"
    >
      {/* Blurry Background on Existing Content */}
      <div className="p-6 sm:p-8 space-y-4 font-mono text-xs filter blur-[4px] opacity-60 dark:opacity-40 select-none pointer-events-none w-full">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE5DC] dark:border-[#26211C] text-[#8C8377] dark:text-[#A89F91]">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-[#B5814C] dark:text-[#D99F50]" />
            <span className="font-semibold">mcp-server-mindspace.local:8080</span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-sans font-medium">
            Connected to Claude &amp; ChatGPT
          </span>
        </div>

        {/* JSON-RPC Request & Response snippet */}
        <div className="space-y-3 text-[11px] leading-relaxed">
          <div className="text-[#8C8377] dark:text-[#A89F91]">// 1. Claude calls Mindspace MCP tool</div>
          <div className="p-3.5 rounded-xl bg-[#F5F0E8] dark:bg-[#1C1814] border border-[#E8DFD2] dark:border-[#2C241D] text-[#8C5E2E] dark:text-amber-300 overflow-x-auto shadow-2xs">
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

          <div className="text-[#8C8377] dark:text-[#A89F91] pt-1">// 2. Mindspace responds with verified source</div>
          <div className="p-3.5 rounded-xl bg-[#F5F0E8] dark:bg-[#1C1814] border border-[#E8DFD2] dark:border-[#2C241D] text-emerald-700 dark:text-emerald-400 overflow-x-auto shadow-2xs">
            {`{
  "match": "Attention Is All You Need (Vaswani et al.)",
  "formula": "softmax(QK^T / sqrt(d_k)) * V",
  "confidence": 0.994,
  "mcp_url": "mindspace://item/arxiv-1706.03762"
}`}
          </div>
        </div>
      </div>

      {/* Centered Overlay: Coming Soon Badge & Join Waiting List Button */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]/40 dark:bg-[#0B0907]/40 backdrop-blur-[2px]">
        <div className="space-y-4 max-w-xs w-full flex flex-col items-center">
          {/* Badge in the middle */}
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/12 dark:bg-amber-400/15 text-amber-800 dark:text-amber-200 border border-amber-500/25 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <span className="size-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            Coming soon
          </span>

          {/* Join Waiting List Action */}
          {!isInputOpen && !joined && (
            <button
              type="button"
              onClick={() => setIsInputOpen(true)}
              className="py-2.5 px-6 rounded-full bg-[#B5814C] hover:bg-[#A3723E] dark:bg-[#C88E3E] dark:hover:bg-[#B5814C] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center gap-2 font-sans"
            >
              <span>Join waiting list</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}

          {isInputOpen && !joined && (
            <form onSubmit={handleSubmit} className="w-full space-y-2">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white dark:bg-[#1C1814] border border-[#DECDBB] dark:border-[#3D3328] shadow-md">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-1.5 text-xs text-[#211D1A] dark:text-[#FAF8F5] bg-transparent outline-none font-sans placeholder:text-neutral-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-[#B5814C] hover:bg-[#A3723E] dark:bg-[#C88E3E] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 font-sans"
                >
                  Join
                </button>
              </div>
            </form>
          )}

          {joined && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium font-sans shadow-sm">
              <Check className="size-4" />
              <span>You&apos;re on the priority waitlist!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
