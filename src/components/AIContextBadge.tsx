import { useState } from "react";

interface AIContextBadgeProps {
  context?: string | null;
  className?: string;
}

export function AIContextBadge({ context, className = "" }: AIContextBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (!context || !context.trim()) return null;

  return (
    <div
      className={`mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-600/10 border border-purple-500/30 dark:border-purple-400/30 backdrop-blur-xs transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 font-bold text-xs text-purple-600 dark:text-purple-300">
          <svg className="size-3.5 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
          <span>AI Visual Context</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-[10px] font-semibold text-purple-500 hover:text-purple-700 dark:hover:text-purple-200 cursor-pointer underline"
        >
          {expanded ? "Show less" : "Read context"}
        </button>
      </div>

      <p
        className={`text-xs text-slate-700 dark:text-slate-200 leading-relaxed transition-all ${
          expanded ? "whitespace-normal" : "line-clamp-2"
        }`}
      >
        {context}
      </p>
    </div>
  );
}
