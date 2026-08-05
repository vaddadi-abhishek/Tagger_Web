export interface RedditBookmark {
  id: string;
  title: string;
  subreddit: string;
  source: string;
  author: string;
  createdAt: string;
  dateStr: string;
  score: number;
  numComments: number;
  permalink: string;
  url?: string;
  thumbnail: string;
  postType: "link" | "image" | "text";
  selftext?: string;
  tags: string[];
  collections?: string[];
}
