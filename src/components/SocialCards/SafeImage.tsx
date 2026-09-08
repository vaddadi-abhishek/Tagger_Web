import React, { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  url?: string | null;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

// Module-level persistent cache of successfully loaded image URLs
// Eliminates blank flash, opacity-0 reset, and re-rendering across card unmounts/filter changes
const globalLoadedImageUrls = new Set<string>();

// Module-level cache of URLs that required the backend proxy
// Prevents failing direct network calls on remounts
const proxyFallbackUrls = new Set<string>();

const getProxyUrl = (raw?: string | null): string => {
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  return `${baseUrl}/proxy-image?url=${encodeURIComponent(raw)}`;
};

function getInitialSrc(url?: string | null): string {
  if (!url) return "";
  if (proxyFallbackUrls.has(url)) {
    return getProxyUrl(url);
  }
  return url;
}

export const SafeImage = React.memo(function SafeImage({
  url,
  alt = "Media image",
  className = "w-full h-full object-cover",
  fallbackIcon,
  ...rest
}: SafeImageProps) {
  const isAlreadyLoaded = Boolean(url && globalLoadedImageUrls.has(url));

  const [currentSrc, setCurrentSrc] = useState<string>(() => getInitialSrc(url));
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(isAlreadyLoaded);

  useEffect(() => {
    const alreadyLoaded = Boolean(url && globalLoadedImageUrls.has(url));
    setCurrentSrc(getInitialSrc(url));
    setHasError(!url);
    setIsLoaded(alreadyLoaded);
  }, [url]);

  const handleError = () => {
    if (url && currentSrc === url && !url.includes("/proxy-image?url=")) {
      // Remember that this URL requires the proxy fallback
      proxyFallbackUrls.add(url);
      setCurrentSrc(getProxyUrl(url));
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    if (url) {
      globalLoadedImageUrls.add(url);
    }
    setIsLoaded(true);
  };

  if (!url || hasError) {
    return (
      <div className={`bg-slate-100 dark:bg-zinc-900/60 flex items-center justify-center text-slate-400 dark:text-zinc-600 ${className}`}>
        {fallbackIcon || (
          <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={isAlreadyLoaded ? "eager" : "lazy"}
      decoding={isAlreadyLoaded ? "sync" : "async"}
      referrerPolicy="no-referrer"
      onError={handleError}
      onLoad={handleLoad}
      className={`${className} ${
        isAlreadyLoaded
          ? "opacity-100"
          : `transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0"}`
      }`}
      {...rest}
    />
  );
});
