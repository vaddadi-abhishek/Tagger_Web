import type { Bookmark, AnyCardData, ArticleContent } from "../types/bookmark";

export interface MetadataResponse {
  url: string;
  title: string;
  description: string;
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

/**
 * Resolves the API base URL dynamically from environment variables (.env).
 * If VITE_API_URL is defined, it is used directly.
 * If omitted, defaults to the relative path '/api/v1', which routes through
 * Vite's proxy during local development and platform rewrites in production.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "/api/v1";
};

const AUTH_TOKEN_KEY = "mindspace_auth_token";
const AUTH_REFRESH_TOKEN_KEY = "mindspace_refresh_token";

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

// Track ongoing refresh promise to prevent parallel stampeding refresh requests
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
      return false;
    }

    const data = (await response.json()) as { token?: string; refreshToken?: string };
    if (data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      if (data.refreshToken) {
        localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Centralized fetch wrapper providing standard authentication, automatic token refresh,
 * response parsing, and strongly typed error propagation.
 */
async function request<T>(
  path: string,
  options: RequestInit & { customHeaders?: Record<string, string>; _isRetry?: boolean } = {}
): Promise<T> {
  const { customHeaders, _isRetry, ...init } = options;
  const headers = getAuthHeaders(customHeaders);

  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  // Handle 401 Unauthorized with silent token refresh (single retry)
  if (response.status === 401 && !_isRetry && !path.startsWith("/auth/")) {
    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      return request<T>(path, { ...options, _isRetry: true });
    }
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      ai_status?: string;
      requireVerification?: boolean;
      email?: string;
    };
    const errorMessage =
      errorData.error || errorData.message || `Request failed (Status ${response.status})`;

    if (response.status === 402 || errorData.error === "NO_CREDITS_LEFT") {
      throw new CreditExhaustedError(errorMessage);
    }

    if (response.status === 403 && errorData.requireVerification) {
      throw new EmailNotVerifiedError(errorMessage, errorData.email || "");
    }

    throw new Error(errorMessage);
  }

  // Support 204 No Content or empty bodies
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export class EmailNotVerifiedError extends Error {
  email: string;
  constructor(message: string, email: string) {
    super(message);
    this.name = "EmailNotVerifiedError";
    this.email = email;
  }
}

// ==========================================
// Authentication Methods (Via Node Backend)
// ==========================================

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const data = await request<{ token?: string; refreshToken?: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
  }
  return data.user;
}

export interface SignUpResponse {
  user: AuthUser | null;
  token?: string | null;
  refreshToken?: string | null;
  message?: string;
  requireVerification?: boolean;
  email?: string;
}

export async function signUpUser(
  email: string,
  password: string,
  username?: string
): Promise<SignUpResponse> {
  const data = await request<SignUpResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, username }),
  });

  if (data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
  }
  return data;
}

export async function verifyOtpUser(
  email: string,
  token: string,
  type: "signup" | "email" = "signup"
): Promise<{ user: AuthUser; message?: string }> {
  const data = await request<{
    user: AuthUser;
    token?: string | null;
    refreshToken?: string | null;
    message?: string;
  }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, token, type }),
  });

  if (data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
  }
  return data;
}

export async function resendOtpUser(
  email: string,
  type: "signup" | "email" = "signup"
): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email, type }),
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  try {
    const data = await request<{ user: AuthUser }>("/auth/me", { method: "GET" });
    return data.user;
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
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

export async function generateAiContext(bookmarkId: string): Promise<Bookmark> {
  return request<Bookmark>(`/bookmarks/${bookmarkId}/ai-context`, {
    method: "POST",
  });
}

export async function triggerGenerateAi(bookmarkId: string): Promise<Bookmark> {
  return generateAiContext(bookmarkId);
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

export async function fetchBookmarkArticle(bookmarkId: string): Promise<ArticleContent> {
  return request<ArticleContent>(`/bookmarks/${bookmarkId}/article`, {
    method: "GET",
  });
}
