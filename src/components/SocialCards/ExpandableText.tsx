import { useState, useRef, useEffect } from "react";

interface ExpandableTextProps {
  text: string;
  prefix?: React.ReactNode;
  maxLength?: number;
  className?: string;
  buttonClassName?: string;
}

export function ExpandableText({
  text,
  prefix,
  maxLength = 200,
  className = "",
  buttonClassName = "",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const isLong = Boolean(text && text.length > maxLength);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [text]);

  if (!text) return null;

  const collapsedHeight = "4.5em";

  return (
    <div className={className}>
      <div
        ref={contentRef}
        style={{
          maxHeight: isLong
            ? isExpanded
              ? contentHeight
                ? `${contentHeight}px`
                : "1000px"
              : collapsedHeight
            : "none",
        }}
        className="transition-[max-height] duration-500 ease-in-out overflow-hidden"
      >
        <p className="whitespace-pre-wrap break-words">
          {prefix}
          {text}
        </p>
      </div>

      {isLong && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }
          }}
          className={`inline-block mt-1 cursor-pointer select-none ${buttonClassName}`}
        >
          {isExpanded ? "Show less" : "Show more"}
        </span>
      )}
    </div>
  );
}

