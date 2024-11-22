import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useFavorites() {
  const [favoritedBookmarks, setFavoritedBookmarks] = useState<Record<string, boolean>>({});
  const [bookmarkFavorites, setBookmarkFavorites] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Tüm favori sayılarını al
      const { data: favoriteCounts } = await supabase
        .from('bookmark_favorites')
        .select('bookmark_id, count')
        .select('bookmark_id');

      const counts: Record<string, number> = {};
      if (favoriteCounts) {
        favoriteCounts.forEach((row: any) => {
          counts[row.bookmark_id] = parseInt(row.count);
        });
      }
      setBookmarkFavorites(counts);

      if (user) {
        // Kullanıcının favorilediği yer imlerini al
        const { data: userFavorites } = await supabase
          .from('bookmark_favorites')
          .select('bookmark_id')
          .eq('user_id', user.id);

        const favorites: Record<string, boolean> = {};
        if (userFavorites) {
          userFavorites.forEach((favorite: any) => {
            favorites[favorite.bookmark_id] = true;
          });
        }
        setFavoritedBookmarks(favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (bookmarkId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Favorilere eklemek için giriş yapmalısınız');
        return;
      }

      const isFavorited = favoritedBookmarks[bookmarkId];
      
      if (isFavorited) {
        await supabase
          .from('bookmark_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmark_id', bookmarkId);
          
        setFavoritedBookmarks(prev => {
          const next = { ...prev };
          delete next[bookmarkId];
          return next;
        });
        
        setBookmarkFavorites(prev => ({
          ...prev,
          [bookmarkId]: (prev[bookmarkId] || 1) - 1
        }));
      } else {
        await supabase
          .from('bookmark_favorites')
          .insert([{ user_id: user.id, bookmark_id: bookmarkId }]);
          
        setFavoritedBookmarks(prev => ({
          ...prev,
          [bookmarkId]: true
        }));
        
        setBookmarkFavorites(prev => ({
          ...prev,
          [bookmarkId]: (prev[bookmarkId] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Bir hata oluştu');
    }
  };

  return {
    favoritedBookmarks,
    bookmarkFavorites,
    loading,
    toggleFavorite
  };
}