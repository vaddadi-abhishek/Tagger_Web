export interface MediaItem {
  type: 'image' | 'video' | string;
  url: string;
}

export interface XCardData {
  author: {
    name: string;
    handle: string;
    avatar_url: string | null;
    verified: boolean;
  };
  metrics: {
    replies?: number;
    reposts?: number;
    likes?: number;
    views?: number;
    bookmarks?: number;
  };
  media: MediaItem[];
  posted_at: string;
}

export interface InstagramCardData {
  author: {
    username: string;
    name: string;
    avatar_url: string | null;
    verified: boolean;
  };
  metrics: {
    likes?: number;
    comments?: number;
  };
  media: MediaItem[];
  images?: Array<string | { url?: string; src?: string; display_url?: string; [key: string]: unknown }>;
  posted_at: string;
}

export interface FacebookCardData {
  author: {
    name: string;
    avatar_url: string | null;
  };
  metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
  media: MediaItem[];
  posted_at: string | null;
}

export interface LinkedInCardData {
  author: {
    name: string;
    avatar_url: string | null;
  };
  metrics: {
    reactions?: number;
    comments?: number;
    reposts?: number;
  };
  media?: MediaItem[];
  posted_at: string | null;
}

export interface RedditCardData {
  subreddit: {
    name: string;
    icon_url: string | null;
  };
  author: string;
  metrics: {
    upvotes?: number;
    comments?: number;
  };
  posted_at: string | null;
  media: MediaItem[];
}

export interface YouTubeCardData {
  channel: {
    name: string;
    avatar_url: string | null;
  };
  metrics: {
    views?: number;
    likes?: number;
  };
  video_id: string | null;
  posted_at: string | null;
}

export interface GlobalWebCardData {
  author: string | null;
  published_at: string | null;
  site_name: string | null;
  type: string | null;
  snapshot?: string | null;
}

export type AnyCardData =
  | XCardData
  | InstagramCardData
  | FacebookCardData
  | LinkedInCardData
  | RedditCardData
  | YouTubeCardData
  | GlobalWebCardData
  | Record<string, unknown>;

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  snapshot?: string | null;
  logo: string | null;
  site_name: string;
  tags?: string[];
  collections?: string[];
  created_at?: string;
  isFetchingMetadata?: boolean;
  type?: string;
  card_data?: AnyCardData;
  ai_context?: string | null;
  ai_tags?: string[];
  visual_entities?: string[];
  ocr_text?: string;
}
