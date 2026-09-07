export interface MetadataResponse {
  url: string;
  title: string;
  description: string;
  snapshot?: string | null;
  logo: string | null;
  site_name: string;
  type?: string;
  card_data?: any;
  ai_context?: string | null;
  ai_tags?: string[];
  visual_entities?: string[];
  ocr_text?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

/**
 * Calls backend POST /api/v1/extract endpoint with target URL to fetch rich metadata & AI Visual Intelligence.
 */
export async function fetchUrlMetadata(url: string): Promise<MetadataResponse> {
  const cleanUrl = url.trim();
  const formattedUrl = cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
    ? cleanUrl
    : `https://${cleanUrl}`;

  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: formattedUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch metadata (Status ${response.status})`
    );
  }

  return response.json();
}

/**
 * Re-analyzes an existing bookmark with AI Visual Intelligence
 */
export async function analyzeBookmarkWithAI(payload: {
  url: string;
  title?: string;
  description?: string;
  snapshot?: string | null;
  site_name?: string;
  type?: string;
  card_data?: any;
}): Promise<{ ai_context: string; ai_tags: string[]; visual_entities?: string[]; ocr_text?: string }> {
  const response = await fetch(`${API_BASE_URL}/ai-analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed AI visual analysis (Status ${response.status})`
    );
  }

  return response.json();
}
