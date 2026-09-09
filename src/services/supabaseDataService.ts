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
  ai_context?:
    | {
        context?: string | null;
        ai_tags?: string[] | null;
        visual_entities?: string[] | null;
        ocr_text?: string | null;
      }
    | Array<{
        context?: string | null;
        ai_tags?: string[] | null;
        visual_entities?: string[] | null;
        ocr_text?: string | null;
      }>
    | string
    | null;
  ai_tags?: string[] | null;
  visual_entities?: string[] | null;
  ocr_text?: string | null;
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

  // Attempt to select bookmarks along with dedicated ai_context table relation
  let rawData: SupabaseBookmarkRow[];
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      *,
      ai_context (
        context,
        ai_tags,
        visual_entities,
        ocr_text
      )
    `)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // If ai_context table or relation does not yet exist in Supabase, fallback to basic select
    console.warn("Notice: Fetching with ai_context relation failed, falling back to base bookmarks:", error.message);
    const fallback = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      console.error("Error fetching bookmarks:", fallback.error);
      throw fallback.error;
    }
    rawData = (fallback.data || []) as unknown as SupabaseBookmarkRow[];
  } else {
    rawData = (data || []) as unknown as SupabaseBookmarkRow[];
  }

  return rawData.map((row: SupabaseBookmarkRow) => {
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

    // Resolve AI context & tags from separate ai_context relation or legacy column
    let aiContextText: string | null = null;
    let aiTagsList: string[] = [];
    let visualEntitiesList: string[] = [];
    let ocrTextVal: string | null = null;

    if (row.ai_context) {
      if (Array.isArray(row.ai_context) && row.ai_context.length > 0) {
        aiContextText = row.ai_context[0]?.context || null;
        aiTagsList = row.ai_context[0]?.ai_tags || [];
        visualEntitiesList = row.ai_context[0]?.visual_entities || [];
        ocrTextVal = row.ai_context[0]?.ocr_text || null;
      } else if (typeof row.ai_context === "object") {
        aiContextText = (row.ai_context as { context?: string | null })?.context || null;
        aiTagsList = (row.ai_context as { ai_tags?: string[] | null })?.ai_tags || [];
        visualEntitiesList = (row.ai_context as { visual_entities?: string[] | null })?.visual_entities || [];
        ocrTextVal = (row.ai_context as { ocr_text?: string | null })?.ocr_text || null;
      } else if (typeof row.ai_context === "string") {
        aiContextText = row.ai_context;
      }
    }

    if ((!aiTagsList || aiTagsList.length === 0) && row.ai_tags && Array.isArray(row.ai_tags)) {
      aiTagsList = row.ai_tags;
    }
    if ((!visualEntitiesList || visualEntitiesList.length === 0) && row.visual_entities && Array.isArray(row.visual_entities)) {
      visualEntitiesList = row.visual_entities;
    }
    if (!ocrTextVal && row.ocr_text && typeof row.ocr_text === "string") {
      ocrTextVal = row.ocr_text;
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
      type: row.type || undefined,
      card_data: parsedCardData,
      ai_context: aiContextText,
      ai_tags: aiTagsList,
      visual_entities: visualEntitiesList,
      ocr_text: ocrTextVal || undefined,
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
    visual_entities?: string[];
    ocr_text?: string | null;
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

  const { error } = await supabase
    .from("bookmarks")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating bookmark metadata in Supabase:", error);
  }

  // Persist AI visual context into dedicated ai_context table
  if (
    metadata.ai_context !== undefined ||
    metadata.ai_tags !== undefined ||
    metadata.visual_entities !== undefined ||
    metadata.ocr_text !== undefined
  ) {
    const { error: aiError } = await supabase
      .from("ai_context")
      .upsert(
        {
          bookmark_id: id,
          user_id: userData.user.id,
          context: metadata.ai_context || null,
          ai_tags: metadata.ai_tags || [],
          visual_entities: metadata.visual_entities || [],
          ocr_text: metadata.ocr_text || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "bookmark_id" }
      );

    if (aiError) {
      console.warn("Notice: could not upsert to ai_context table:", aiError.message);
    }
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
