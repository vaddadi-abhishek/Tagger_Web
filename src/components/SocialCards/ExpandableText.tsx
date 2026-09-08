import React, { useState } from "react";

interface ExpandableTextProps {
  text: string;
  prefix?: React.ReactNode;
  maxLength?: number;
  className?: string;
  buttonClassName?: string;
}

export const ExpandableText = React.memo(function ExpandableText({
  text,
  prefix,
  maxLength = 200,
  className = "",
  buttonClassName = "",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = Boolean(text && text.length > maxLength);

  if (!text) return null;

  return (
    <div className={className}>
      <div
        style={{
          maxHeight: isLong ? (isExpanded ? "2000px" : "4.5em") : "none",
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
});
