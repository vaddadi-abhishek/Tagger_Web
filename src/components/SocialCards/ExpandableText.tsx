import React, { useState, useRef, useLayoutEffect } from "react";

/**
 * Common measurement function to determine if text in an element overflows 3 lines,
 * and calculate the exact 3-line height and full scroll height.
 */
export function measure3LineMetrics(el: HTMLElement) {
  const computed = window.getComputedStyle(el);
  const lh = parseFloat(computed.lineHeight);
  const fontSize = parseFloat(computed.fontSize) || 12;
  const singleLine = !isNaN(lh) && lh > 0 ? lh : fontSize * 1.5;
  const threeLineHeight = Math.round(singleLine * 3);
  const fullHeight = el.scrollHeight;
  const isOverflowing = fullHeight > threeLineHeight + 2;

  return {
    isOverflowing,
    threeLineHeight,
    fullHeight,
  };
}

export interface ExpandableTextProps {
  text: string;
  prefix?: React.ReactNode;
  maxLength?: number;
  className?: string;
  buttonClassName?: string;
  moreLabel?: string;
  lessLabel?: string;
}

/**
 * Common ExpandableText component with unified show more / show less button and smooth slow height transition.
 * Used consistently across all social cards and generic cards.
 */
export const ExpandableText = React.memo(function ExpandableText({
  text,
  prefix,
  className = "",
  buttonClassName = "",
  moreLabel = "show more...",
  lessLabel = "show less",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number>(58);
  const [fullHeight, setFullHeight] = useState<number>(58);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const { isOverflowing, threeLineHeight, fullHeight: measuredFull } = measure3LineMetrics(el);
      setCollapsedHeight(threeLineHeight);
      setCanExpand(isOverflowing);

      if (isOverflowing) {
        setFullHeight(measuredFull);
      }
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [text, prefix]);

  if (!text) return null;

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (contentRef.current) {
      setFullHeight(contentRef.current.scrollHeight);
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="relative">
      <div
        ref={contentRef}
        style={{
          maxHeight: canExpand
            ? isExpanded
              ? `${fullHeight}px`
              : `${collapsedHeight}px`
            : "none",
          transition: "max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="overflow-hidden"
      >
        <p className={`whitespace-pre-wrap break-words ${className}`}>
          {prefix}
          {text}
        </p>
      </div>

      {canExpand && (
        <span
          role="button"
          tabIndex={0}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleToggle(e);
            }
          }}
          className={`inline-flex items-center gap-1 mt-1 text-[11.5px] font-semibold text-[var(--primary)] hover:underline cursor-pointer select-none transition-colors duration-200 active:scale-95 ${buttonClassName}`}
        >
          {isExpanded ? lessLabel : moreLabel}
        </span>
      )}
    </div>
  );
});
