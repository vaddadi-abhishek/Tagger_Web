import { supabase } from "../lib/supabase";
import type { Bookmark, AnyCardData } from "../types/bookmark";

interface SupabaseBookmarkRow {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  snapshot_url: string | null;
  logo_url: string | null;
  site_name: string | null;
  type: string | null;
  card_data: unknown;
  ai_context: string | null;
  ai_tags: string[] | null;
  tags?: string[] | null;
  collections?: string[] | null;
  created_at: string | null;
  updated_at?: string | null;
}

// ============================================================================
// BOOKMARKS CRUD WITH AUTH ISOLATION
// ============================================================================

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }

  return (data || []).map((row: SupabaseBookmarkRow) => {
    let siteName = row.site_name;
    if (!siteName && row.url) {
      try {
        siteName = new URL(row.url).hostname.replace(/^www\./, "");
      } catch {
        siteName = "Web";
      }
    }

    let parsedCardData: AnyCardData | undefined = undefined;
    if (row.card_data) {
      if (typeof row.card_data === "string") {
        try {
          parsedCardData = JSON.parse(row.card_data) as AnyCardData;
        } catch {
          parsedCardData = undefined;
        }
      } else if (typeof row.card_data === "object") {
        parsedCardData = row.card_data as AnyCardData;
      }
    }

    return {
      id: row.id,
      url: row.url,
      title: row.title || row.url,
      description: row.description || "",
      snapshot: row.snapshot_url || null,
      logo: row.logo_url || null,
      site_name: siteName || "Web",
      tags: row.tags || [],
      collections: row.collections || [],
      created_at: row.created_at || new Date().toISOString(),
      isFetchingMetadata: false,
      type: row.type || undefined,
      card_data: parsedCardData,
      ai_context: row.ai_context || null,
      ai_tags: row.ai_tags || [],
    };
  });
}

export async function createBookmark(params: {
  url: string;
  title?: string;
  description?: string;
  snapshot?: string | null;
  logo?: string | null;
  site_name?: string;
}): Promise<Bookmark> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("User not authenticated");

  let siteName = params.site_name || "";
  if (!siteName && params.url) {
    try {
      siteName = new URL(params.url).hostname.replace(/^www\./, "");
    } catch {
      siteName = "Web";
    }
  }

  // Insert Bookmark row into Supabase scoped to authenticated user
  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userData.user.id,
      url: params.url,
      title: params.title || params.url,
      description: params.description || null,
      snapshot_url: params.snapshot || null,
      logo_url: params.logo || null,
      site_name: siteName || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title || bookmark.url,
    description: bookmark.description || "",
    snapshot: bookmark.snapshot_url || null,
    logo: bookmark.logo_url || null,
    site_name: siteName || "Web",
    tags: [],
    collections: [],
    created_at: bookmark.created_at || new Date().toISOString(),
    isFetchingMetadata: true,
  };
}

export async function updateBookmarkMetadata(
  id: string,
  metadata: {
    title?: string;
    description?: string;
    snapshot?: string | null;
    logo?: string | null;
    site_name?: string;
    type?: string | null;
    card_data?: AnyCardData;
    ai_context?: string | null;
    ai_tags?: string[];
  }
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;

  const updatePayload: Record<string, unknown> = {
    title: metadata.title,
    description: metadata.description,
    snapshot_url: metadata.snapshot,
    logo_url: metadata.logo,
    site_name: metadata.site_name,
    type: metadata.type,
    card_data: metadata.card_data,
    updated_at: new Date().toISOString(),
  };

  if (metadata.ai_context !== undefined) {
    updatePayload.ai_context = metadata.ai_context;
  }
  if (metadata.ai_tags !== undefined) {
    updatePayload.ai_tags = metadata.ai_tags;
  }

  const { error } = await supabase
    .from("bookmarks")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating bookmark metadata in Supabase:", error);
  }
}

export async function deleteBookmark(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) throw error;
}

export async function updateBookmarkDetails(
  id: string,
  title: string,
  description: string
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("bookmarks")
    .update({
      title: title.trim(),
      description: description.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating bookmark details in Supabase:", error);
    throw error;
  }
}
