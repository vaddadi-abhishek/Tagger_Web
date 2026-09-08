import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { AnyCardData } from "../types/bookmark";

export interface MetadataResponse {
  url: string;
  title: string;
  description: string;
  snapshot?: string | null;
  logo: string | null;
  site_name: string;
  type?: string;
  card_data?: AnyCardData;
  ai_context?: string | null;
  ai_tags?: string[];
  visual_entities?: string[];
  ocr_text?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

/**
 * Returns authentication headers containing Supabase Bearer token if user is signed in.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isSupabaseConfigured) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Session unavailable, proceed with unauthenticated request
    }
  }

  return headers;
}

/**
 * Validates and formats a URL string, ensuring http/https protocol.
 */
function validateAndFormatUrl(rawUrl: string): string {
  const cleanUrl = rawUrl.trim();
  if (!cleanUrl) {
    throw new Error("Target URL cannot be empty");
  }

  const formatted =
    cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
      ? cleanUrl
      : `https://${cleanUrl}`;

  try {
    const parsed = new URL(formatted);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid URL protocol. Only http and https are supported.");
    }
    return parsed.href;
  } catch {
    throw new Error("Invalid URL format");
  }
}

/**
 * Calls backend POST /api/v1/extract endpoint with target URL to fetch rich metadata & AI Visual Intelligence.
 */
export async function fetchUrlMetadata(url: string): Promise<MetadataResponse> {
  const validatedUrl = validateAndFormatUrl(url);
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url: validatedUrl }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string };
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
  card_data?: AnyCardData;
}): Promise<{
  ai_context: string;
  ai_tags: string[];
  visual_entities?: string[];
  ocr_text?: string;
}> {
  const validatedUrl = validateAndFormatUrl(payload.url);
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/ai-analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...payload, url: validatedUrl }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      errorData.error || `Failed AI visual analysis (Status ${response.status})`
    );
  }

  return response.json();
}
