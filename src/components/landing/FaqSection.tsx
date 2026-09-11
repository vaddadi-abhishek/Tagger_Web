import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ArrowRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does the 7-day free trial work?",
    answer:
      "When you create your account, you immediately receive 7 full days of unrestricted Pro access. This includes unlimited bookmark saves, full AI visual context analysis, native MCP server connectivity for Claude and ChatGPT, and in-app conversational RAG across all your bookmarks and media transcripts. No credit card is required to begin.",
  },
  {
    question: "What happens after the trial ends on the $5 plan?",
    answer:
      "You will never lose your saved links. Bookmark saving remains completely unlimited forever. On the $5 Starter plan, automated AI visual context extraction and auto-tagging is capped at 5 cards per week, and you maintain full access to fast semantic search across your entire library.",
  },
  {
    question: "How does the MCP integration work with Claude or ChatGPT?",
    answer:
      "Mindspace operates a native Model Context Protocol (MCP) server. You add our lightweight connection snippet to your Claude configuration or MCP client. From that moment, whenever you chat with Claude or ChatGPT, the model can query your personal bookmarks, cite past research, and recall transcripts directly in your conversations.",
  },
  {
    question: "Does Mindspace download copyright media?",
    answer:
      "No. Mindspace does not download, pirate, or host proprietary media files. We index publicly available metadata, video timestamps, speech-to-text transcripts, and OCR text extracted from your own screenshots. All original media remains hosted on its respective source platform.",
  },
];

interface FaqSectionProps {
  onStartFree: () => void;
}

export function FaqSection({ onStartFree }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* ─── FAQs Accordion ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-28">
        {/* Left column info */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Everything you need to know about our trial, data retention, MCP protocols, and media indexing.
          </p>
        </div>

        {/* Right column accordion */}
        <div className="lg:col-span-8 divide-y divide-neutral-200 dark:divide-neutral-800">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-6 first:pt-0 last:pb-0">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {faq.question}
                  </span>
                  <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0 transition-transform">
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Minimal, Calm Closing Banner ─── */}
      <div className="relative rounded-3xl p-10 sm:p-16 text-center overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-amber-50/40 dark:from-neutral-900 dark:to-neutral-950 shadow-sm">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans leading-tight">
            Stop letting what matters get buried in tabs.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Turn scattered bookmarks, screenshots, and links into an intelligent second brain powered by AI auto-tagging, visual context, and conversational RAG.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onStartFree}
              className="px-8 py-4 rounded-full bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-sm sm:text-base shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>Start for free</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
