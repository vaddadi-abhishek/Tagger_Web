export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function sanitizeUrl(url?: string): string {
  if (!url) return "#";
  // Filter out non-printable ASCII control characters without regex range
  const clean = Array.from(url)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .trim();

  if (!clean) return "#";

  const lower = clean.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  if (!/^https?:\/\//i.test(clean)) {
    return `https://${clean}`;
  }

  return clean;
}


