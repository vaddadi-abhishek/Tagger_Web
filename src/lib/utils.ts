export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sanitizes a URL string to ensure it uses safe http:// or https:// protocols.
 * Prevents javascript: or data: XSS attacks.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "#";
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

