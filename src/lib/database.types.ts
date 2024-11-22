export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          description: string
          tags: string[]
          is_public: boolean
          created_at: string
          language: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title?: string
          description?: string
          tags?: string[]
          is_public?: boolean
          created_at?: string
          language?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          description?: string
          tags?: string[]
          is_public?: boolean
          created_at?: string
          language?: string
        }
      }
      bookmark_likes: {
        Row: {
          id: string
          user_id: string
          bookmark_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bookmark_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bookmark_id?: string
          created_at?: string
        }
      }
      bookmark_favorites: {
        Row: {
          id: string
          user_id: string
          bookmark_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bookmark_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bookmark_id?: string
          created_at?: string
        }
      }
      pinned_bookmarks: {
        Row: {
          id: string
          bookmark_id: string
          is_pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          bookmark_id: string
          is_pinned?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          bookmark_id?: string
          is_pinned?: boolean
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}