import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

interface PricingSectionProps {
  onSelectTier: (tier: "starter" | "pro") => void;
}

export function PricingSection({ onSelectTier }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
          Simple, honest pricing for serious thinkers.
        </h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          Start with full access for 7 days. Keep your saved bookmarks forever regardless of plan.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span
            className={`text-xs sm:text-sm font-medium ${
              !isAnnual ? "text-neutral-900 dark:text-white" : "text-neutral-500"
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
              className={`size-4 rounded-full bg-neutral-900 dark:bg-white shadow-xs transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs sm:text-sm font-medium ${
                isAnnual ? "text-neutral-900 dark:text-white" : "text-neutral-500"
              }`}
            >
              Annual Billing
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Two Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Starter Tier */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-8 relative">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Essential Knowledge Layer
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Starter
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Perfect for individuals needing an intelligent, organized memory vault.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight font-sans">
                ${isAnnual ? "4" : "5"}
              </span>
              <span className="text-xs text-neutral-500 font-mono">/ month</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
              🎁 7-Day All-Access Free Trial included with unlimited bookmarks & AI context.
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Unlimited bookmark saving forever (even post-trial)",
                "Post-trial AI auto-tagging (5 cards per week)",
                "Visual snapshot & title extraction",
                "Basic semantic search across all items",
                "Chrome & Safari extension support",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                  <Check className="size-4 text-neutral-900 dark:text-white shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTier("starter")}
            className="w-full py-3.5 px-6 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold text-xs sm:text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Pro Tier (Featured) */}
        <div className="rounded-3xl p-8 sm:p-10 bg-neutral-950 text-white border border-neutral-800 shadow-2xl flex flex-col justify-between space-y-8 relative overflow-hidden">
          {/* Subtle warm amber top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Frontier AI Integration
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold uppercase">
                Most Popular
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="text-xs text-neutral-400">
                For researchers, builders, and heavy thinkers wanting limitless AI memory.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                ${isAnnual ? "7" : "9"}
              </span>
              <span className="text-xs text-neutral-400 font-mono">/ month</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium">
              ⚡ Full frontier connection to Claude Desktop, ChatGPT & Cursor.
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Unlimited bookmark saves forever",
                "Unlimited AI visual context & Vision OCR parsing",
                "Full MCP Server access (ChatGPT, Claude & Gemini)",
                "In-app RAG chatbot across all bookmarks & transcripts",
                "Timestamped podcast citations & instant audio jumps",
                "Priority 1,536-dimensional vector embedding updates",
                "Priority email & Discord technical support",
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
            Upgrade to Pro
          </button>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
        <ShieldCheck className="size-4 text-emerald-600" />
        <span>No credit card required for 7-day trial · Cancel anytime with one click</span>
      </div>
    </section>
  );
}
