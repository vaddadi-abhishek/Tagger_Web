import type { Bookmark, AnyCardData } from "../types/bookmark";

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
  ai_category?: string[];
  ai_tags?: string[];
  visual_entities?: string[];
  ocr_text?: string;
  ai_status?: "completed" | "pending_manual" | "no_credits" | "failed";
}

export interface UserPlanInfo {
  plan: "free" | "pro";
  is_paid: boolean;
  credits_remaining: number;
  credits_limit: number;
  credits_used: number;
  credits_reset_at: string;
  trial_ends_at: string;
  auto_ai_context: boolean;
}

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
}

/**
 * Custom error thrown when the user's AI processing credits have been exhausted.
 */
export class CreditExhaustedError extends Error {
  readonly code = "NO_CREDITS_LEFT";
  constructor(message: string = "No free credits remaining") {
    super(message);
    this.name = "CreditExhaustedError";
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const AUTH_TOKEN_KEY = "mindspace_auth_token";
const AUTH_USER_KEY = "mindspace_auth_user";

/**
 * Returns authentication headers containing Bearer token from localStorage.
 */
function getAuthHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
 * Centralized fetch wrapper providing standard authentication, response parsing,
 * and strongly typed error propagation.
 */
async function request<T>(
  path: string,
  options: RequestInit & { customHeaders?: Record<string, string> } = {}
): Promise<T> {
  const { customHeaders, ...init } = options;
  const headers = getAuthHeaders(customHeaders);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      ai_status?: string;
    };
    const errorMessage =
      errorData.error || errorData.message || `Request failed (Status ${response.status})`;

    if (response.status === 402 || errorData.error === "NO_CREDITS_LEFT") {
      throw new CreditExhaustedError(errorMessage);
    }

    throw new Error(errorMessage);
  }

  // Support 204 No Content or empty bodies
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

// ==========================================
// Authentication Methods (Via Node Backend)
// ==========================================

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const data = await request<{ token?: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }
  return data.user;
}

export async function signUpUser(
  email: string,
  password: string,
  username?: string
): Promise<{ user: AuthUser | null; message?: string }> {
  const data = await request<{ user: AuthUser | null; token?: string; message?: string }>(
    "/auth/signup",
    {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    }
  );

  if (data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  try {
    const data = await request<{ user: AuthUser }>("/auth/me", { method: "GET" });
    return data.user;
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

// ==========================================
// Bookmark Methods (Via Node Backend)
// ==========================================

export async function fetchBookmarks(): Promise<Bookmark[]> {
  return request<Bookmark[]>("/bookmarks", { method: "GET" });
}

export async function createBookmark(url: string, autoAiContext: boolean = true): Promise<Bookmark> {
  const validatedUrl = validateAndFormatUrl(url);
  return request<Bookmark>("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ url: validatedUrl }),
    customHeaders: {
      "X-Auto-AI-Context": String(autoAiContext),
    },
  });
}

export async function triggerGenerateAi(bookmarkId: string): Promise<Bookmark> {
  return request<Bookmark>(`/bookmarks/${bookmarkId}/generate-ai`, {
    method: "POST",
  });
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  return request<void>(`/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
}

export async function getUserPlan(): Promise<UserPlanInfo> {
  return request<UserPlanInfo>("/user/plan", { method: "GET" });
}

export async function updateUserSettings(settings: { auto_ai_context: boolean }): Promise<void> {
  return request<void>("/user/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}

export async function fetchUrlMetadata(url: string): Promise<MetadataResponse> {
  const validatedUrl = validateAndFormatUrl(url);
  return request<MetadataResponse>("/extract", {
    method: "POST",
    body: JSON.stringify({ url: validatedUrl }),
  });
}

