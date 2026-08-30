export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  snapshot: string | null;
  logo: string | null;
  site_name: string;
  tags: string[];
  collections?: string[];
  created_at?: string;
  isFetchingMetadata?: boolean;
}

