import { useState, useEffect, useCallback } from "react";
import { Glass } from "@samasante/liquid-glass";
import type { Bookmark } from "../types/bookmark";
import { sanitizeUrl } from "../lib/utils";

interface AiContextModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  onClose: () => void;
}

export function AiContextModal({ isOpen, bookmark, onClose }: AiContextModalProps) {
  const [copied, setCopied] = useState(false);

  // Keyboard shortcut listener for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const aiContext = bookmark?.ai_context;

  const handleCopySummary = useCallback(async () => {
    if (!aiContext) return;
    try {
      await navigator.clipboard.writeText(aiContext);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard failure
    }
  }, [aiContext]);

  if (!isOpen || !bookmark) return null;

  const hasContext = Boolean(bookmark.ai_context && bookmark.ai_context.trim().length > 0);
  const hasTags = Boolean(bookmark.ai_tags && bookmark.ai_tags.length > 0);
  const hasEntities = Boolean(bookmark.visual_entities && bookmark.visual_entities.length > 0);
  const hasOcr = Boolean(bookmark.ocr_text && bookmark.ocr_text.trim().length > 0);
  const hasAnyData = hasContext || hasTags || hasEntities || hasOcr;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/25 dark:bg-black/45 animate-in fade-in duration-200"
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
          {/* Header: Swiss Minimalist Brand, Subtitle & Circular Dismiss */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-500/20 shrink-0">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-white/15 dark:bg-white/10 text-[var(--text-h)] border border-white/20 dark:border-white/10">
                  {bookmark.site_name || "Web"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)] opacity-60">
                  AI Intelligence
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-h)] leading-snug line-clamp-2">
                {bookmark.title || bookmark.url}
              </h3>
              <p className="text-[13px] font-mono font-semibold text-[var(--text)] opacity-60 truncate">
                {bookmark.url}
              </p>
            </div>

            <button
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

          {/* Modal Body: Structured Swiss Hierarchy */}
          <div className="space-y-5 overflow-y-auto pr-1 py-4 flex-1 select-text">
            {/* Section 1: Context Synthesis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70">
                  Context Synthesis
                </span>
                {hasContext && (
                  <button
                    onClick={handleCopySummary}
                    className="text-[11px] font-medium text-[var(--text)] hover:text-[var(--text-h)] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="size-3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 opacity-70 hover:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="size-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                          />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="rounded-2xl p-4 sm:p-5 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[var(--text-h)] font-normal whitespace-pre-line tracking-tight">
                  {bookmark.ai_context || (
                    <span className="italic text-[var(--text)] opacity-60">
                      No visual AI context generated for this link yet.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Section 2: AI Tags */}
            {hasTags && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                  Auto-Generated Tags ({bookmark.ai_tags!.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bookmark.ai_tags!.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 hover:border-white/30 dark:hover:border-white/20 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Visual Entities */}
            {hasEntities && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                  Visual Entities ({bookmark.visual_entities!.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bookmark.visual_entities!.map((entity) => (
                    <span
                      key={entity}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 dark:bg-white/5 text-[var(--text-h)] border border-white/20 dark:border-white/10 hover:border-white/30 dark:hover:border-white/20 transition-colors"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: OCR Text */}
            {hasOcr && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text)] opacity-70 block">
                  Detected Media Text (OCR)
                </span>
                <div className="rounded-2xl p-3.5 sm:p-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-xs font-mono text-[var(--text-h)] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {bookmark.ocr_text}
                </div>
              </div>
            )}

            {/* Fallback empty state */}
            {!hasAnyData && (
              <div className="rounded-2xl p-6 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-center space-y-1.5">
                <p className="text-xs font-semibold text-[var(--text-h)]">No AI Context Available</p>
                <p className="text-[11px] text-[var(--text)] opacity-60">
                  Visual intelligence is still processing or unavailable for this link.
                </p>
              </div>
            )}
          </div>

          {/* Footer: Swiss Minimalist Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-500/20 shrink-0">
            <a
              href={sanitizeUrl(bookmark.url)}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[var(--text)] hover:text-[var(--text-h)] transition-colors flex items-center gap-1.5 group"
            >
              <span>Visit Source</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>

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
