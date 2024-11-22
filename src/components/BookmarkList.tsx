import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search, ExternalLink, Edit, Trash2, Tag, Heart, Star, TrendingUp, Pin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLikes } from '../hooks/useLikes';
import { useBookmarks } from '../hooks/useBookmarks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { getMetaTitle, getMetaDescription, createSEFUrl } from '@/utils/seo';
import type { Bookmark as BookmarkType } from '../types';

interface Props {
  bookmarks: BookmarkType[];
  onEdit: (bookmark: BookmarkType) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function BookmarkList({ bookmarks, onEdit, onDelete, loading }: Props) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { tag: urlTag } = useParams();
  const { user, isAdmin } = useAuth();
  const { t, i18n } = useTranslation();
  const { stats, togglePinned } = useBookmarks();
  const { 
    likedBookmarks, 
    favoritedBookmarks, 
    bookmarkLikes, 
    bookmarkFavorites, 
    toggleLike, 
    toggleFavorite 
  } = useLikes();

  const selectedTag = urlTag ? decodeURIComponent(urlTag) : null;

  // Find the language of the first bookmark with the selected tag
  useEffect(() => {
    if (selectedTag && bookmarks.length > 0) {
      const bookmarksWithTag = bookmarks.filter(bookmark => 
        bookmark.tags.some(tag => createSEFUrl(tag) === selectedTag)
      );

      if (bookmarksWithTag.length > 0) {
        const tagLanguage = bookmarksWithTag[0].language;
        if (tagLanguage !== i18n.language) {
          navigate(`/${tagLanguage}/tag/${selectedTag}`);
        }
      }
    }
  }, [selectedTag, bookmarks, i18n.language, navigate]);

  const filterBookmarks = (bookmarkList: BookmarkType[]) => {
    return bookmarkList.filter(bookmark => {
      const matchesSearch = search.toLowerCase() === '' ||
        bookmark.title.toLowerCase().includes(search.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(search.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(search.toLowerCase());

      const matchesTag = !selectedTag || bookmark.tags.some(tag => createSEFUrl(tag) === selectedTag);
      return matchesSearch && matchesTag;
    });
  };

  const publicBookmarks = bookmarks.filter(b => b.is_public);
  const userBookmarks = bookmarks.filter(b => user && b.user_id === user.id);
  const favoritedUserBookmarks = bookmarks.filter(b => favoritedBookmarks[b.id]);

  const trendingBookmarks = [...publicBookmarks]
    .sort((a, b) => {
      if (a.pinned_bookmarks?.is_pinned && !b.pinned_bookmarks?.is_pinned) return -1;
      if (!a.pinned_bookmarks?.is_pinned && b.pinned_bookmarks?.is_pinned) return 1;

      const aScore = (bookmarkLikes[a.id] || 0) + (bookmarkFavorites[a.id] || 0);
      const bScore = (bookmarkLikes[b.id] || 0) + (bookmarkFavorites[b.id] || 0);
      return bScore - aScore;
    })
    .slice(0, 10);

  const filteredPublicBookmarks = filterBookmarks(publicBookmarks);
  const filteredUserBookmarks = filterBookmarks(userBookmarks);
  const filteredFavoritedBookmarks = filterBookmarks(favoritedUserBookmarks);
  const filteredTrendingBookmarks = filterBookmarks(trendingBookmarks);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const BookmarkCard = ({ bookmark }: { bookmark: BookmarkType }) => (
    <Card key={bookmark.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow space-y-1 min-w-0">
            {bookmark.pinned_bookmarks?.is_pinned && (
              <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
                <Pin className="h-4 w-4" />
                <span>{t('bookmarks.pinnedByAdmin')}</span>
              </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {bookmark.title || bookmark.url}
            </h3>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 truncate"
            >
              {bookmark.url}
              <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <div className="flex items-start space-x-1 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike(bookmark.id)}
                className={`p-1 h-8 ${
                  likedBookmarks[bookmark.id]
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-sm">{bookmarkLikes[bookmark.id] || 0}</span>
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(bookmark.id)}
                  className={`p-1 h-8 ${
                    favoritedBookmarks[bookmark.id]
                      ? 'text-yellow-500'
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm">{bookmarkFavorites[bookmark.id] || 0}</span>
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePinned(bookmark.id)}
                  className={`p-1 h-8 ${
                    bookmark.pinned_bookmarks?.is_pinned
                      ? 'text-blue-500'
                      : 'text-gray-400 hover:text-blue-500'
                  }`}
                  title={t('bookmarks.pinUnpinTooltip')}
                >
                  <Pin className="h-4 w-4" />
                </Button>
              )}

              {(isAdmin || (user && bookmark.user_id === user.id)) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(bookmark)}
                    className="p-1 h-8 text-gray-400 hover:text-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(bookmark.id)}
                    className="p-1 h-8 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        {bookmark.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {bookmark.description}
          </p>
        )}
        {bookmark.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bookmark.tags.map(tag => (
              <Link
                key={tag}
                to={`/${bookmark.language}/tag/${createSEFUrl(tag)}`}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                  selectedTag === createSEFUrl(tag)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Tag className={`mr-1 h-3 w-3 ${
                  selectedTag === createSEFUrl(tag)
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`} />
                {tag}
                {bookmark.language !== i18n.language && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({t(`languages.${bookmark.language}`)})
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {selectedTag && (
        <Helmet>
          <title>{getMetaTitle(selectedTag)}</title>
          <meta name="description" content={getMetaDescription(selectedTag)} />
        </Helmet>
      )}

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t('bookmarks.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {user && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{t('bookmarks.yourStats')}:</span>
            {Object.entries(stats).map(([lang, count]) => (
              <span key={lang} className="flex items-center gap-1">
                <span className="font-medium">{count}</span>
                {t('bookmarks.inLanguage', { language: t(`languages.${lang}`) })}
              </span>
            ))}
          </div>
        )}

        {selectedTag && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">{selectedTag}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${i18n.language}`)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t('bookmarks.clearFilter')}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={user ? "all" : "trending"} className="space-y-4">
        <TabsList className="w-full justify-start">
          {!user ? (
            <>
              <TabsTrigger value="trending">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('tabs.trending')}
              </TabsTrigger>
              <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
              <TabsTrigger value="myBookmarks">{t('tabs.myBookmarks')}</TabsTrigger>
              <TabsTrigger value="favorites">{t('tabs.favorites')}</TabsTrigger>
            </>
          )}
        </TabsList>

        {!user && (
          <TabsContent value="trending" className="space-y-3">
            {filteredTrendingBookmarks.map(bookmark => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </TabsContent>
        )}

        <TabsContent value="all" className="space-y-3">
          {filteredPublicBookmarks.map(bookmark => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </TabsContent>

        {user && (
          <>
            <TabsContent value="myBookmarks" className="space-y-3">
              {filteredUserBookmarks.map(bookmark => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </TabsContent>
            <TabsContent value="favorites" className="space-y-3">
              {filteredFavoritedBookmarks.map(bookmark => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}