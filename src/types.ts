export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  language: string;
  pinned_bookmarks?: {
    is_pinned: boolean;
  } | null;
}