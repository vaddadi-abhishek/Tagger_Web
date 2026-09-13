import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ArrowRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "When you create your account, you immediately receive 14 full days of unrestricted access to all AI features. This includes unlimited bookmark saves, full AI visual context analysis across your bookmarks and transcripts. No credit card is required to begin.",
  },
  {
    question: "What happens after the 14-day trial ends if I don't upgrade?",
    answer:
      "You will never lose your saved links. Bookmark saving remains completely unlimited forever. Your account simply transitions to our Free Collector plan, which includes up to 3 AI auto-tagged links per week and full access to your saved library. You can upgrade to Thinker ($5/mo billed annually or $8/mo monthly) or join the Architect waitlist at any time. Active Thinker members receive priority beta access to Architect.",
  },
  {
    question: "How does AI auto-tagging and visual context work?",
    answer:
      "When you save a social post or article, Mindspace analyzes the content and imagery using multimodal AI. It identifies key concepts, extracts embedded text via OCR, and generates contextual tags automatically—allowing you to find anything by what you remember without ever managing folders or manual labels.",
  },
  {
    question: "Is my saved content private and secure?",
    answer:
      "Yes. Your library is strictly private to your account. All saved posts and articles are protected with encryption both in transit and at rest. You maintain complete control and ownership over everything in your knowledge vault.",
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
            Everything you need to know about our trial, AI features, privacy, and plans.
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
            Turn scattered bookmarks and links into an intelligent second brain powered by AI auto-tagging and deep visual context.
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
