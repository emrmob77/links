import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useLikes() {
  const [likedBookmarks, setLikedBookmarks] = useState<Record<string, boolean>>({});
  const [favoritedBookmarks, setFavoritedBookmarks] = useState<Record<string, boolean>>({});
  const [bookmarkLikes, setBookmarkLikes] = useState<Record<string, number>>({});
  const [bookmarkFavorites, setBookmarkFavorites] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Tüm beğeni ve favori sayılarını al
      const { data: likeCounts, error: likeError } = await supabase
        .from('bookmark_likes')
        .select('bookmark_id')
        .select('bookmark_id');

      const { data: favoriteCounts, error: favoriteError } = await supabase
        .from('bookmark_favorites')
        .select('bookmark_id')
        .select('bookmark_id');

      if (likeError) throw likeError;
      if (favoriteError) throw favoriteError;

      // Her bookmark için beğeni sayısını hesapla
      const likes: Record<string, number> = {};
      const favorites: Record<string, number> = {};

      if (likeCounts) {
        likeCounts.forEach((row: any) => {
          likes[row.bookmark_id] = (likes[row.bookmark_id] || 0) + 1;
        });
      }

      if (favoriteCounts) {
        favoriteCounts.forEach((row: any) => {
          favorites[row.bookmark_id] = (favorites[row.bookmark_id] || 0) + 1;
        });
      }

      setBookmarkLikes(likes);
      setBookmarkFavorites(favorites);

      if (user) {
        // Kullanıcının kendi beğeni ve favorilerini al
        const { data: userLikes } = await supabase
          .from('bookmark_likes')
          .select('bookmark_id')
          .eq('user_id', user.id);

        const { data: userFavorites } = await supabase
          .from('bookmark_favorites')
          .select('bookmark_id')
          .eq('user_id', user.id);

        const userLikeStatus: Record<string, boolean> = {};
        const userFavoriteStatus: Record<string, boolean> = {};

        if (userLikes) {
          userLikes.forEach((like: any) => {
            userLikeStatus[like.bookmark_id] = true;
          });
        }

        if (userFavorites) {
          userFavorites.forEach((favorite: any) => {
            userFavoriteStatus[favorite.bookmark_id] = true;
          });
        }

        setLikedBookmarks(userLikeStatus);
        setFavoritedBookmarks(userFavoriteStatus);
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (bookmarkId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('anonymousId') || crypto.randomUUID();
      
      if (!user) {
        localStorage.setItem('anonymousId', anonymousId);
      }

      const userId = user?.id || anonymousId;
      const isLiked = likedBookmarks[bookmarkId];
      
      if (isLiked) {
        await supabase
          .from('bookmark_likes')
          .delete()
          .eq('user_id', userId)
          .eq('bookmark_id', bookmarkId);
          
        setLikedBookmarks(prev => {
          const next = { ...prev };
          delete next[bookmarkId];
          return next;
        });
        
        setBookmarkLikes(prev => ({
          ...prev,
          [bookmarkId]: Math.max(0, (prev[bookmarkId] || 1) - 1)
        }));
      } else {
        await supabase
          .from('bookmark_likes')
          .insert([{ user_id: userId, bookmark_id: bookmarkId }]);
          
        setLikedBookmarks(prev => ({
          ...prev,
          [bookmarkId]: true
        }));
        
        setBookmarkLikes(prev => ({
          ...prev,
          [bookmarkId]: (prev[bookmarkId] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Bir hata oluştu');
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
          [bookmarkId]: Math.max(0, (prev[bookmarkId] || 1) - 1)
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
    likedBookmarks,
    favoritedBookmarks,
    bookmarkLikes,
    bookmarkFavorites,
    loading,
    toggleLike,
    toggleFavorite
  };
}