import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';

export type Bookmark = Tables['bookmarks'] & {
  pinned_bookmarks?: { is_pinned: boolean } | null;
};
export type BookmarkFormData = Omit<Bookmark, 'id' | 'user_id' | 'created_at' | 'pinned_bookmarks'>;

export type BookmarkStats = {
  [key: string]: number;
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookmarkStats>({});
  const { i18n, t } = useTranslation();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchBookmarks();
    fetchStats();
  }, [i18n.language]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('language, count')
        .select('language')
        .eq(user ? 'user_id' : 'is_public', user ? user.id : true);

      if (error) throw error;

      const stats: BookmarkStats = {};
      data.forEach((row: any) => {
        stats[row.language] = (stats[row.language] || 0) + 1;
      });
      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const currentLang = i18n.language;

      let query = supabase
        .from('bookmarks')
        .select(`
          *,
          pinned_bookmarks!left(
            is_pinned
          )
        `);

      // For tag pages, show bookmarks from all languages
      if (!window.location.pathname.includes('/tag/')) {
        query = query.eq('language', currentLang);
      }

      if (user) {
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (data: BookmarkFormData) => {
    try {
      if (!user) throw new Error(t('auth.signInRequired'));

      const { error } = await supabase.from('bookmarks').insert([
        {
          ...data,
          language: i18n.language,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) throw error;

      await fetchBookmarks();
      await fetchStats();
      toast.success(t('bookmarks.addSuccess'));
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const updateBookmark = async (id: string, data: BookmarkFormData) => {
    try {
      if (!user) throw new Error(t('auth.signInRequired'));

      const query = supabase
        .from('bookmarks')
        .update({
          ...data,
          language: i18n.language
        })
        .eq('id', id);

      // If admin, allow updating any bookmark
      if (!isAdmin) {
        query.eq('user_id', user.id);
      }

      const { error } = await query;

      if (error) throw error;

      await fetchBookmarks();
      await fetchStats();
      toast.success(t('bookmarks.updateSuccess'));
    } catch (error: any) {
      console.error('Error updating bookmark:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      if (!user) throw new Error(t('auth.signInRequired'));

      const query = supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      // If admin, allow deleting any bookmark
      if (!isAdmin) {
        query.eq('user_id', user.id);
      }

      const { error } = await query;

      if (error) throw error;

      await fetchBookmarks();
      await fetchStats();
      toast.success(t('bookmarks.deleteSuccess'));
    } catch (error: any) {
      console.error('Error deleting bookmark:', error);
      toast.error(error.message);
    }
  };

  const togglePinned = async (bookmarkId: string) => {
    try {
      if (!user || !isAdmin) {
        toast.error(t('auth.adminRequired'));
        return;
      }

      const { data: existing } = await supabase
        .from('pinned_bookmarks')
        .select('*')
        .eq('bookmark_id', bookmarkId)
        .single();

      if (existing) {
        await supabase
          .from('pinned_bookmarks')
          .delete()
          .eq('bookmark_id', bookmarkId);
      } else {
        await supabase
          .from('pinned_bookmarks')
          .insert([{ bookmark_id: bookmarkId }]);
      }

      await fetchBookmarks();
      toast.success(t('bookmarks.pinToggleSuccess'));
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      toast.error(error.message);
    }
  };

  return {
    bookmarks,
    loading,
    stats,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    togglePinned
  };
}