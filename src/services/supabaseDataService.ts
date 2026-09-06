import { supabase } from "../lib/supabase";
import type { Bookmark } from "../types/bookmark";

// ============================================================================
// BOOKMARKS CRUD
// ============================================================================

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }

  return (data || []).map((row: any) => {
    let siteName = row.site_name;
    if (!siteName && row.url) {
      try {
        siteName = new URL(row.url).hostname.replace(/^www\./, "");
      } catch {
        siteName = "Web";
      }
    }

    let parsedCardData = row.card_data || null;
    if (typeof parsedCardData === "string") {
      try {
        parsedCardData = JSON.parse(parsedCardData);
      } catch {
        // keep as is
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
      tags: [],
      collections: [],
      created_at: row.created_at || new Date().toISOString(),
      isFetchingMetadata: false,
      type: row.type || null,
      card_data: parsedCardData,
      ai_context: row.ai_context || null,
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
  if (!userData.user) throw new Error("User not authenticated");

  // Insert Bookmark row into Supabase
  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userData.user.id,
      url: params.url,
      title: params.title || params.url,
      description: params.description || null,
      snapshot_url: params.snapshot || null,
      logo_url: params.logo || null,
      site_name: params.site_name || null,
    })
    .select()
    .single();

  if (error) throw error;

  let siteName = params.site_name || "";
  if (!siteName && params.url) {
    try {
      siteName = new URL(params.url).hostname.replace(/^www\./, "");
    } catch {
      siteName = "Web";
    }
  }

  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title || bookmark.url,
    description: bookmark.description || "",
    snapshot: bookmark.snapshot_url || null,
    logo: bookmark.logo_url || null,
    site_name: siteName,
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
    card_data?: any;
  }
): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .update({
      title: metadata.title,
      description: metadata.description,
      snapshot_url: metadata.snapshot,
      logo_url: metadata.logo,
      site_name: metadata.site_name,
      type: metadata.type,
      card_data: metadata.card_data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating bookmark metadata in Supabase:", error);
  }
}

export async function deleteBookmark(id: string): Promise<void> {
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  if (error) throw error;
}

export async function updateBookmarkDetails(
  id: string,
  title: string,
  description: string
): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .update({
      title: title.trim(),
      description: description.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating bookmark details in Supabase:", error);
    throw error;
  }
}
