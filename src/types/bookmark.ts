export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  snapshot: string | null;
  logo: string | null;
  site_name: string;
  published_at: string | null;
  tags: string[];
  collections?: string[];
  created_at?: string;
  isFetchingMetadata?: boolean;
}

