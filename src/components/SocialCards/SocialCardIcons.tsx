export function VerticalMoreIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

export function HorizontalMoreIcon({ className = "size-4 pointer-events-none" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

export function VerifiedBadge({ className = "w-[1.125rem] h-[1.125rem] shrink-0 fill-[#1d9bf0]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-label="Verified account" className={className}>
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.084.34-.13.69-.13 1.05 0 2.21 1.71 4 3.918 4 .58 0 1.13-.153 1.616-.425 1.492 1.253 3.39 2 5.466 2 2.076 0 3.973-.747 5.466-2 .486.272 1.036.425 1.616.425 2.21 0 3.918-1.792 3.918-4 0-.36-.046-.71-.13-1.05 1.105-.704 1.846-1.99 1.846-3.45z" />
      <path fill="black" d="M10.67 15.266L7.336 12l1.378-1.42 1.956 1.897 4.542-4.66 1.42 1.378-5.963 6.07z" />
    </svg>
  );
}

// ==========================================
// X / TWITTER ICONS
// ==========================================
export function XBrandLogo({ className = "w-[1.25rem] h-[1.25rem] fill-slate-900 dark:fill-[#e7e9ea] shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ReplyIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
    </svg>
  );
}

export function RepostIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
    </svg>
  );
}

export function LikeHeartIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
    </svg>
  );
}

export function BookmarkIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
    </svg>
  );
}

export function ShareIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
    </svg>
  );
}

// ==========================================
// INSTAGRAM ICONS
// ==========================================
export function InstagramBrandLogo({ className = "w-6 h-6 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="ig-colored-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285aeb" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ig-colored-gradient)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

export function InstagramLikeIcon({ className = "w-6 h-6 fill-current shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" aria-label="Like" role="img">
      <path
        d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.071 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramCommentIcon({ className = "w-6 h-6 stroke-current fill-none shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" aria-label="Comment" role="img">
      <path
        d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function InstagramRepostIcon({ className = "w-6 h-6 stroke-current fill-none shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24">
      <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function InstagramShareAirplaneIcon({ className = "w-6 h-6 stroke-current fill-none shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" aria-label="Share" role="img">
      <line
        x1="22"
        y1="3"
        x2="9.218"
        y2="10.083"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <polygon
        points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function InstagramBookmarkRibbonIcon({ className = "w-6 h-6 stroke-current fill-none shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="24" height="24" aria-label="Save" role="img">
      <polygon
        points="20 21 12 13.44 4 21 4 3 20 3 20 21"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

// ==========================================
// FACEBOOK ICONS
// ==========================================
export function FacebookBrandLogo({ className = "w-6 h-6 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Facebook">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
      <path
        fill="#FFFFFF"
        d="M16.671 15.457l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h2.686V4.91s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.657H7.078v3.47h3.047v8.385a12.09 12.09 0 0 0 3.743 0v-8.385h2.796z"
      />
    </svg>
  );
}

export function FacebookLikeBadge({ className = "w-[18px] h-[18px] rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-sm" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.317.733-.51 1.058-.29.488-.682.996-1.15 1.504a11.144 11.144 0 0 1-.954.914l-.066.057C3.593 7.828 3.25 8.1 3 8.35v6.516c.38.163.85.284 1.417.38 1.135.19 2.658.254 4.583.254h.478c1.378 0 2.548-.823 3.003-2.022l1.39-3.707A2.8 2.8 0 0 0 14 8.78V7.5a2.5 2.5 0 0 0-2.5-2.5H9.72c.117-.728.175-1.507.144-2.316a5.534 5.534 0 0 0-.464-2.122 2.03 2.03 0 0 0-.536-.516zM2 8.5a.5.5 0 0 0-.5.5v5.5a.5.5 0 0 0 .5.5h.5V8.5H2z" />
      </svg>
    </div>
  );
}

export function FacebookShareIcon({ className = "w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5V18" />
    </svg>
  );
}

// ==========================================
// LINKEDIN ICONS
// ==========================================
export function LinkedInBrandLogo({ className = "w-6 h-6 fill-[#0a66c2]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function LinkedInLikeIcon({ className = "w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function LinkedInReactionBadge({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="like-consumption-ring-small"
      width="16"
      height="16"
      aria-hidden="true"
      data-supported-dps="16x16"
      viewBox="0 0 16 16"
      data-token-id="17"
      className={className}
    >
      <circle cx="8" cy="8" r="7.5" fill="#378fe9" />
      <path fill="#fff" d="M8 1a7 7 0 1 1-7 7 7 7 0 0 1 7-7m0-1a8 8 0 1 0 5.66 2.34A8 8 0 0 0 8 0" />
      <path
        fill="#d0e8ff"
        fillRule="evenodd"
        d="M11.93 7.25h-.55c-.05 0-.15-.19-.4-.46-.37-.4-.78-.91-1.07-1.19a7.1 7.1 0 0 1-1.73-2.24c-.24-.51-.26-.74-.75-.74a.78.78 0 0 0-.67.81c0 .14.07.63.1.8a7.5 7.5 0 0 0 1 2.2H4.12a.88.88 0 0 0-.65.28.84.84 0 0 0-.23.66.91.91 0 0 0 .93.85h.16a.82.82 0 0 0-.55.24.77.77 0 0 0-.21.54.81.81 0 0 0 .74.8.8.8 0 0 0 .33 1.42.76.76 0 0 0-.09.55.87.87 0 0 0 .85.63h2.29a3.8 3.8 0 0 0 .89-.11l1.42-.4h1.9c1.02-.04 1.29-4.64.03-4.64"
      />
      <path fill="none" d="M7.3 3.72a6.4 6.4 0 0 0 1.15 2.71M5.94 11.9h2.18a16 16 0 0 0 1.9-.54h1.36" />
      <path
        fill="none"
        stroke="#004182"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.43 6.43H4.11a.88.88 0 0 0-.88 1 .92.92 0 0 0 .93.84h.16a.82.82 0 0 0-.55.24.77.77 0 0 0-.21.56.83.83 0 0 0 .74.81.81.81 0 0 0-.31.63.81.81 0 0 0 .65.8.78.78 0 0 0-.09.56.86.86 0 0 0 .85.62h2.29a3.8 3.8 0 0 0 .89-.11l1.42-.47h1.9c1 0 1.27-4.64 0-4.64a5 5 0 0 1-.55 0s-.15-.19-.4-.46h0c-.37-.4-.78-.91-1.07-1.19a7.1 7.1 0 0 1-1.7-2.25 2.1 2.1 0 0 0-.32-.52.83.83 0 0 0-1.16.09 1.4 1.4 0 0 0-.25.38 1.7 1.7 0 0 0-.09.3 2.4 2.4 0 0 0 .07.84 4 4 0 0 0 .27.84 6.7 6.7 0 0 0 .66 1 .2.2 0 0 1 .07.08"
      />
    </svg>
  );
}

export function LinkedInCommentIcon({ className = "w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

export function LinkedInRepostIcon({ className = "w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function LinkedInSendIcon({ className = "w-5 h-5 fill-none stroke-current stroke-[1.75] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

// ==========================================
// REDDIT ICONS
// ==========================================
export function RedditAlienLogo({ className = "w-4 h-4 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16.67,10A1.46,1.46,0,0,0,14.2,9a7.12,7.12,0,0,0-3.85-1.23L11.46,3.5,13.71,4A1.84,1.84,0,0,0,15.8,5.36a1.85,1.85,0,1,0-1.89-2.31l-2.43-.54a.39.39,0,0,0-.47.28L9.9,7.82A7.17,7.17,0,0,0,6,9a1.46,1.46,0,1,0-2.47,1A4.77,4.77,0,0,0,3.15,13a6.11,6.11,0,0,0,14,0A4.77,4.77,0,0,0,16.67,10Zm-10,3.75A1.56,1.56,0,1,1,8.23,12.2,1.56,1.56,0,0,1,6.67,13.75Zm4,2.5a5.53,5.53,0,0,1-3.62-1.26.4.4,0,0,1,.54-.6A4.6,4.6,0,0,0,10.67,15.5a4.65,4.65,0,0,0,3.08-1.11.4.4,0,0,1,.54.6A5.53,5.53,0,0,1,10.67,16.25Zm2.66-2.5A1.56,1.56,0,1,1,14.9,12.2,1.56,1.56,0,0,1,13.33,13.75Z" />
    </svg>
  );
}

export function UpvoteIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.004.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8Z" />
    </svg>
  );
}

export function DownvoteIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Z" />
    </svg>
  );
}

export function CommentIcon({ className = "w-[1.125rem] h-[1.125rem] fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 19H1.871a.886.886 0 0 1-.798-.52.886.886 0 0 1 .158-.941L3.1 15.771A9 9 0 1 1 10 19Zm-6.549-1.5H10a7.5 7.5 0 1 0-5.323-2.219l.54.545L3.451 17.5Z" />
    </svg>
  );
}

// ==========================================
// YOUTUBE ICONS
// ==========================================
export function YouTubeBrandLogo({ className = "w-6 h-6 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="YouTube">
      {/* Official YouTube Red Rounded Rectangle */}
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      {/* Official YouTube White Play Triangle */}
      <polygon fill="#FFFFFF" points="9.545 15.568 9.545 8.432 15.818 12" />
    </svg>
  );
}

export function YouTubeLikeIcon({ className = "w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function YouTubeDislikeIcon({ className = "w-4 h-4 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

export function SparkleIcon({ className = "w-4 h-4 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );
}

// ==========================================
// PINTEREST ICONS
// ==========================================
export function PinterestBrandLogo({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Pinterest" fill="none">
      <circle cx="12" cy="12" r="12" fill="#E60023" />
      <path
        fill="white"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12c0 3.17 1.98 5.89 4.8 6.98-.07-.59-.13-1.5.03-2.15.14-.59.9-3.83.9-3.83s-.23-.46-.23-1.14c0-1.07.62-1.87 1.4-1.87.66 0 .98.5 0.98 1.09 0 .66-.42 1.66-.64 2.58-.18.78.39 1.41 1.16 1.41 1.39 0 2.46-1.47 2.46-3.59 0-1.88-1.35-3.19-3.28-3.19-2.39 0-3.8 1.8-3.8 3.65 0 .73.28 1.5.63 1.93.07.09.08.16.06.25-.07.28-.21.87-.24 1-.04.16-.13.2-.3.12-1.13-.53-1.84-2.18-1.84-3.51 0-2.86 2.08-5.49 6-5.49 3.2 0 5.68 2.28 5.68 5.32 0 3.18-2 5.73-4.78 5.73-.93 0-1.81-.49-2.11-1.06l-.57 2.19c-.21.8-.77 1.8-1.15 2.42.86.27 1.78.41 2.73.41 4.14 0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"
      />
    </svg>
  );
}

