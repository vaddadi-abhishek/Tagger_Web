import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Bookmark } from "../../types/bookmark";
import { VerticalMoreIcon, HorizontalMoreIcon } from "./SocialCardIcons";

export type CardMenuTheme =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "reddit"
  | "pinterest"
  | "generic";

interface CardActionMenuProps {
  bookmark: Bookmark;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  onRequestDelete?: (id: string) => void;
  onViewAiContext?: (bookmark: Bookmark) => void;
  onGenerateAiContext?: (bookmark: Bookmark) => void;
  isGeneratingAi?: boolean;
  icon?: "vertical" | "horizontal";
  theme?: CardMenuTheme;
  buttonClassName?: string;
  customButtonContent?: React.ReactNode;
}

const themeStyles: Record<
  CardMenuTheme,
  {
    menuBg: string;
    border: string;
    text: string;
    divider: string;
    hoverBg: string;
  }
> = {
  facebook: {
    menuBg: "bg-white dark:bg-[#242526]",
    border: "border-slate-200 dark:border-[#3a3b3c]",
    text: "text-slate-900 dark:text-[#e4e6eb]",
    divider: "border-slate-200 dark:border-[#3a3b3c]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#3a3b3c]",
  },
  twitter: {
    menuBg: "bg-white dark:bg-black",
    border: "border-slate-200 dark:border-[#2f3336]",
    text: "text-slate-900 dark:text-[#e7e9ea]",
    divider: "border-slate-200 dark:border-[#2f3336]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#16181c]",
  },
  instagram: {
    menuBg: "bg-white dark:bg-[#121212]",
    border: "border-slate-200 dark:border-[#262626]",
    text: "text-slate-900 dark:text-[#f5f5f5]",
    divider: "border-slate-200 dark:border-[#262626]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#262626]",
  },
  linkedin: {
    menuBg: "bg-white dark:bg-[#1b1f23]",
    border: "border-slate-200 dark:border-[#38434f]",
    text: "text-slate-900 dark:text-[#f3f6f8]",
    divider: "border-slate-200 dark:border-[#38434f]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#28323d]",
  },
  youtube: {
    menuBg: "bg-white dark:bg-[#0f0f0f]",
    border: "border-slate-200 dark:border-[#272727]",
    text: "text-slate-900 dark:text-[#f1f1f1]",
    divider: "border-slate-200 dark:border-[#272727]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#272727]",
  },
  reddit: {
    menuBg: "bg-white dark:bg-[#1a1a1b]",
    border: "border-slate-200 dark:border-[#343536]",
    text: "text-slate-900 dark:text-[#d7dadc]",
    divider: "border-slate-200 dark:border-[#343536]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#272729]",
  },
  pinterest: {
    menuBg: "bg-white dark:bg-[#1f1f1f]",
    border: "border-slate-200 dark:border-[#333333]",
    text: "text-slate-900 dark:text-[#f5f5f5]",
    divider: "border-slate-200 dark:border-[#333333]",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-[#2b2b2b]",
  },
  generic: {
    menuBg: "bg-white dark:bg-zinc-900",
    border: "border-slate-200 dark:border-zinc-800",
    text: "text-slate-900 dark:text-zinc-200",
    divider: "border-slate-200 dark:border-zinc-800",
    hoverBg: "hover:bg-slate-100 dark:hover:bg-zinc-800",
  },
};

export const CardActionMenu = React.memo(function CardActionMenu({
  bookmark,
  isOpen,
  onToggle,
  onClose,
  onRequestDelete,
  onViewAiContext,
  onGenerateAiContext,
  isGeneratingAi = false,
  icon = "vertical",
  theme = "generic",
  buttonClassName = "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer text-slate-500 dark:text-[#b0b3b8] outline-none",
  customButtonContent,
}: CardActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);

  // Position calculation relative to viewport
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const menuEstimatedHeight = 90;
      const openUpward =
        rect.bottom + menuEstimatedHeight > window.innerHeight &&
        rect.top > menuEstimatedHeight;

      setCoords({
        top: openUpward ? undefined : rect.bottom + 6,
        bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    updatePosition();
  }, [isOpen]);

  // Close menu on outside click, window scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, {
        capture: true,
      });
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const styles = themeStyles[theme] || themeStyles.generic;

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(e);
        }}
        className={buttonClassName}
        title="More options"
        type="button"
      >
        {customButtonContent ? (
          customButtonContent
        ) : icon === "horizontal" ? (
          <HorizontalMoreIcon />
        ) : (
          <VerticalMoreIcon />
        )}
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom:
                coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              right: `${coords.right}px`,
            }}
            className={`w-44 rounded-xl border shadow-xl z-50 text-[13px] font-medium py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left ${styles.menuBg} ${styles.border} ${styles.text}`}
            onClick={(e) => e.stopPropagation()}
          >
            {bookmark.ai_status === "completed" || bookmark.ai_context ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAiContext?.(bookmark);
                  onClose();
                }}
                className={`w-full text-left px-3.5 py-1.5 ${styles.hoverBg} transition-colors flex items-center gap-2 font-medium cursor-pointer`}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="size-3.5 shrink-0 opacity-70"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                  />
                </svg>
                <span>AI Context</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateAiContext?.(bookmark);
                  onClose();
                }}
                disabled={isGeneratingAi}
                className={`w-full text-left px-3.5 py-1.5 ${styles.hoverBg} transition-colors flex items-center gap-2 font-medium cursor-pointer text-amber-600 dark:text-amber-400`}
                type="button"
              >
                {isGeneratingAi ? (
                  <svg
                    className="animate-spin size-3.5 shrink-0 text-amber-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="size-3.5 shrink-0 text-amber-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                    />
                  </svg>
                )}
                <span>{isGeneratingAi ? "Generating AI..." : "Generate AI"}</span>
              </button>
            )}
            <hr className={`${styles.divider} my-1`} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete?.(bookmark.id);
                onClose();
              }}
              className="w-full text-left px-3.5 py-1.5 hover:bg-red-500/10 text-red-500 transition-colors font-medium cursor-pointer"
              type="button"
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
});
