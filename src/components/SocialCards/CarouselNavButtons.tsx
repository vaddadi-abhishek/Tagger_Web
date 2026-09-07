import React from "react";

export interface CarouselNavButtonsProps {
  activeIndex: number;
  total: number;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  className?: string;
}

export function CarouselPrevButton({
  onClick,
  className = "",
}: {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
      }}
      aria-label="Previous slide"
      className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-6.5 h-6.5 rounded-full bg-white/85 hover:bg-white text-slate-800 dark:bg-black/75 dark:hover:bg-black/95 dark:text-white shadow-md flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95 cursor-pointer outline-none ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

export function CarouselNextButton({
  onClick,
  className = "",
}: {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
      }}
      aria-label="Next slide"
      className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-6.5 h-6.5 rounded-full bg-white/85 hover:bg-white text-slate-800 dark:bg-black/75 dark:hover:bg-black/95 dark:text-white shadow-md flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95 cursor-pointer outline-none ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

export function CarouselNavButtons({
  activeIndex,
  total,
  onPrev,
  onNext,
  className = "",
}: CarouselNavButtonsProps) {
  if (total <= 1) return null;

  return (
    <>
      {activeIndex > 0 && (
        <CarouselPrevButton onClick={onPrev} className={className} />
      )}
      {activeIndex < total - 1 && (
        <CarouselNextButton onClick={onNext} className={className} />
      )}
    </>
  );
}
