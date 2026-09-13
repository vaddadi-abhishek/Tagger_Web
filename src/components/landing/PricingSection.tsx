import { useState } from "react";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onSelectTier: (tier: "free" | "starter" | "pro") => void;
}

export function PricingSection({ onSelectTier }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Simple pricing for serious thinkers.
        </h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          Start completely free with 14  days free trail. Keep your saved bookmarks forever regardless of plan.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span
            className={`text-xs sm:text-sm font-medium ${!isAnnual ? "text-neutral-900 dark:text-white" : "text-neutral-500"
              }`}
          >
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 p-1 relative transition-colors cursor-pointer"
            aria-label="Toggle annual billing"
          >
            <div
              className={`size-4 rounded-full bg-neutral-900 dark:bg-white shadow-xs transition-transform ${isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs sm:text-sm font-medium ${isAnnual ? "text-neutral-900 dark:text-white" : "text-neutral-500"
                }`}
            >
              Annual Billing
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
              Save 37%
            </span>
          </div>
        </div>
      </div>

      {/* Three Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {/* Tier 1: Free Tier */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-8 relative">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                Free Forever
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Collector
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Essential smart bookmarking for everyday browsing. Save what matters and never organize again.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight font-sans">
                $0
              </span>
              <span className="text-xs text-neutral-500 font-mono">/ forever</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
              🎁 14 days unlimited access to AI features for all new users.
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Save unlimited links and articles.",
                "Auto AI text and image tagging up to 3 saved links per week.",
                "Cloud sync bookmarks to mobile app.",
                "Extension support for Chrome, Brave, Firefox & Safari",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                  <Check className="size-4 text-neutral-900 dark:text-white shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTier("free")}
            className="w-full py-3.5 px-6 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold text-xs sm:text-sm hover:border-amber-400 dark:hover:border-amber-400 transition-colors cursor-pointer"
          >
            Get Started Free
          </button>
        </div>

        {/* Tier 2: Starter Tier */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-8 relative">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                Essential Knowledge Layer
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Thinker
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Perfect for individuals needing an intelligent, self organized memory vault.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight font-sans">
                ${isAnnual ? "5" : "8"}
              </span>
              <span className="text-xs text-neutral-500 font-mono">/ month</span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Everything in Free.",
                "Unlimited access to AI features.",
                "Unlimited Auto AI text and image tagging.",
                "Image text recognition.",
                "Reading Mode for all the Articles.",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                  <Check className="size-4 text-neutral-900 dark:text-white shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTier("pro")}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
          >
            Upgrade
          </button>
        </div>

        {/* Tier 3: Pro Tier (Featured) */}
        <div className="rounded-3xl p-8 sm:p-10 bg-neutral-950 text-white border border-neutral-800 shadow-2xl flex flex-col justify-between space-y-8 relative overflow-hidden ring-1 ring-amber-500/20">
          {/* Subtle warm amber top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Frontier AI Integration
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Architect</h3>
              <p className="text-xs text-neutral-400">
                For researchers, builders, and heavy thinkers wanting limitless AI memory.
              </p>
              <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-xs text-amber-500 dark:text-amber-300 font-medium leading-relaxed">
                Active Thinker members receive priority beta access to new features.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Everything in Thinker.",
                "Ask MindSpace AI about anything you've saved.",
                "MindSpace AI in Reading Mode",
                "MCP Server access to Claude, ChatGPT, and many other AI tools.",
                "YouTube full transcript available to answer your queries.",
                "Priority Email & technical support",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-neutral-200">
                  <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTier("pro")}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
          >
            Join Waiting List
          </button>
        </div>
      </div>
    </section>
  );
}
