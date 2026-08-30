import { supabase } from "../lib/supabase";
import type { CollectionItem } from "../types/collection";
import type { TagItem } from "../types/tag";
import type { Bookmark } from "../types/bookmark";

// ============================================================================
// COLLECTIONS CRUD
// ============================================================================

export async function fetchCollections(): Promise<CollectionItem[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("collection_created_at", { ascending: true });

  if (error) {
    console.error("Error fetching collections:", error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.collection_name,
    count: 0,
    color: row.collection_color || "#f97316",
  }));
}

export async function createCollection(name: string, color?: string): Promise<CollectionItem> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .insert([
      {
        user_id: userData.user.id,
        collection_name: name.trim(),
        collection_color: color || "#f97316",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.collection_name,
    count: 0,
    color: data.collection_color || "#f97316",
  };
}

export async function updateCollection(id: string, name: string, color?: string): Promise<void> {
  const { error } = await supabase
    .from("collections")
    .update({
      collection_name: name.trim(),
      collection_color: color || "#f97316",
      collection_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating collection:", error);
    throw error;
  }
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
}

// ============================================================================
// TAGS CRUD
// ============================================================================

export async function fetchTags(): Promise<TagItem[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("tag_created_at", { ascending: true });

  if (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.tag_name,
    count: 0,
    color: row.tag_color || "#10b981",
  }));
}

export async function createTag(name: string, color?: string): Promise<TagItem> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  const cleanName = name.replace(/^#/, "").trim();

  const { data, error } = await supabase
    .from("tags")
    .insert([
      {
        user_id: userData.user.id,
        tag_name: cleanName,
        tag_color: color || "#10b981",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.tag_name,
    count: 0,
    color: data.tag_color || "#10b981",
  };
}

export async function updateTag(id: string, name: string, color?: string): Promise<void> {
  const cleanName = name.replace(/^#/, "").trim();

  const { error } = await supabase
    .from("tags")
    .update({
      tag_name: cleanName,
      tag_color: color || "#10b981",
      tag_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating tag:", error);
    throw error;
  }
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
}

// ============================================================================
// BOOKMARKS CRUD & JUNCTIONS
// ============================================================================

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      *,
      bookmark_collections (
        collection_id,
        collections ( id, collection_name )
      ),
      bookmark_tags (
        tag_id,
        tags ( id, tag_name )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }

  return (data || []).map((row) => {
    const collectionsList: string[] = (row.bookmark_collections || [])
      .map((bc: any) => bc.collections?.collection_name)
      .filter(Boolean);

    const tagsList: string[] = (row.bookmark_tags || [])
      .map((bt: any) => bt.tags?.tag_name)
      .filter(Boolean);

    let siteName = row.site_name || "";
    if (!siteName && row.url) {
      try {
        siteName = new URL(row.url).hostname.replace(/^www\./, "");
      } catch {
        siteName = "Web";
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
      tags: tagsList,
      collections: collectionsList,
      created_at: row.created_at || new Date().toISOString(),
      isFetchingMetadata: false,
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
  collectionIds?: string[];
  tagIds?: string[];
  collectionNames?: string[];
  tagNames?: string[];
}): Promise<Bookmark> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  // 1. Insert Bookmark row into Supabase
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

  // 2. Link Collections in junction table
  if (params.collectionIds && params.collectionIds.length > 0) {
    const collectionInserts = params.collectionIds.map((cId) => ({
      bookmark_id: bookmark.id,
      collection_id: cId,
    }));
    await supabase.from("bookmark_collections").insert(collectionInserts);
  }

  // 3. Link Tags in junction table
  if (params.tagIds && params.tagIds.length > 0) {
    const tagInserts = params.tagIds.map((tId) => ({
      bookmark_id: bookmark.id,
      tag_id: tId,
    }));
    await supabase.from("bookmark_tags").insert(tagInserts);
  }

  let siteName = params.site_name || "";
  if (!siteName && params.url) {
    try {
      siteName = new URL(params.url).hostname.replace(/^www\./, "");
    } catch {
      siteName = "Web";
    }
  }

  const collectionsList = params.collectionNames || [];
  const tagsList = params.tagNames || [];

  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title || bookmark.url,
    description: bookmark.description || "",
    snapshot: bookmark.snapshot_url || null,
    logo: bookmark.logo_url || null,
    site_name: siteName,
    tags: tagsList,
    collections: collectionsList,
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

export async function updateBookmarkCollections(
  bookmarkId: string,
  collectionNames: string[],
  availableCollections: CollectionItem[]
): Promise<CollectionItem[]> {
  // 1. Delete existing junction entries for this bookmark
  const { error: delError } = await supabase
    .from("bookmark_collections")
    .delete()
    .eq("bookmark_id", bookmarkId);

  if (delError) {
    console.error("Error clearing bookmark collections:", delError);
    throw delError;
  }

  // 2. Match collection names to IDs or auto-create missing collections
  const matchedIds: string[] = [];
  const updatedCollections = [...availableCollections];

  for (const rawName of collectionNames) {
    const trimmed = rawName.trim();
    if (!trimmed) continue;

    let matched = updatedCollections.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (!matched) {
      try {
        matched = await createCollection(trimmed);
        updatedCollections.push(matched);
      } catch (err) {
        console.error(`Error auto-creating collection '${trimmed}' in Supabase:`, err);
      }
    }

    if (matched && !matchedIds.includes(matched.id)) {
      matchedIds.push(matched.id);
    }
  }

  // 3. Insert new junction rows into bookmark_collections
  if (matchedIds.length > 0) {
    const inserts = matchedIds.map((cId) => ({
      bookmark_id: bookmarkId,
      collection_id: cId,
    }));
    const { error: insError } = await supabase
      .from("bookmark_collections")
      .insert(inserts);

    if (insError) {
      console.error("Error inserting bookmark collections:", insError);
      throw insError;
    }
  }

  return updatedCollections;
}

export async function updateBookmarkTags(
  bookmarkId: string,
  tagNames: string[],
  availableTags: TagItem[]
): Promise<TagItem[]> {
  // 1. Delete existing junction entries for this bookmark
  const { error: delError } = await supabase
    .from("bookmark_tags")
    .delete()
    .eq("bookmark_id", bookmarkId);

  if (delError) {
    console.error("Error clearing bookmark tags:", delError);
    throw delError;
  }

  // 2. Match tag names to IDs or auto-create missing tags
  const matchedIds: string[] = [];
  const updatedTags = [...availableTags];

  for (const rawName of tagNames) {
    const cleanName = rawName.replace(/^#/, "").trim();
    if (!cleanName) continue;

    let matched = updatedTags.find(
      (t) => t.name.toLowerCase().replace(/^#/, "") === cleanName.toLowerCase()
    );

    if (!matched) {
      try {
        matched = await createTag(cleanName);
        updatedTags.push(matched);
      } catch (err) {
        console.error(`Error auto-creating tag '${cleanName}' in Supabase:`, err);
      }
    }

    if (matched && !matchedIds.includes(matched.id)) {
      matchedIds.push(matched.id);
    }
  }

  // 3. Insert new junction rows into bookmark_tags
  if (matchedIds.length > 0) {
    const inserts = matchedIds.map((tId) => ({
      bookmark_id: bookmarkId,
      tag_id: tId,
    }));
    const { error: insError } = await supabase
      .from("bookmark_tags")
      .insert(inserts);

    if (insError) {
      console.error("Error inserting bookmark tags:", insError);
      throw insError;
    }
  }

  return updatedTags;
}
