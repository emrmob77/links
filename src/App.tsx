import React from 'react';
import { Bookmark as BookmarkIcon, LogIn, UserPlus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import BookmarkForm from './components/BookmarkForm';
import BookmarkList from './components/BookmarkList';
import AuthModal from './components/AuthModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import ImportBookmarks from './components/ImportBookmarks';
import Layout from './components/Layout';
import { useBookmarks } from './hooks/useBookmarks';
import { useAuth } from './hooks/useAuth';
import PopularTags from './components/PopularTags';
import { Bookmark } from './types';

function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { bookmarks, loading, addBookmark, deleteBookmark, updateBookmark, stats } = useBookmarks();
  const [editingBookmark, setEditingBookmark] = React.useState<Bookmark | null>(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleEdit = (bookmark: Bookmark) => {
    if (!user) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setEditingBookmark(bookmark);
  };

  const handleUpdate = async (data: Omit<Bookmark, 'id' | 'user_id' | 'created_at' | 'pinned_bookmarks'>) => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, data);
      setEditingBookmark(null);
    }
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const getHomeUrl = () => {
    return i18n.language === 'en' ? '/' : `/${i18n.language}`;
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Helmet>
                <title>{t('meta.title')}</title>
                <meta name="description" content={t('meta.description')} />
                <meta property="og:title" content={t('meta.title')} />
                <meta property="og:description" content={t('meta.description')} />
                <meta name="twitter:title" content={t('meta.title')} />
                <meta name="twitter:description" content={t('meta.description')} />
              </Helmet>

              <Toaster position="top-right" />
              
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <Link to={getHomeUrl()} className="flex items-center">
                    <BookmarkIcon className="h-8 w-8 text-blue-600" />
                    <h1 className="ml-3 text-2xl font-bold text-gray-900">
                      {t('common.appName')}
                    </h1>
                  </Link>
                  <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    {user ? (
                      <>
                        <ImportBookmarks />
                        <button
                          onClick={signOut}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('auth.signOut')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAuthClick('login')}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          {t('auth.signIn')}
                        </button>
                        <button
                          onClick={() => handleAuthClick('register')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t('auth.signUp')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {user && (
                    <div className="lg:col-span-1">
                      <div className="sticky top-8">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                          <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {editingBookmark ? t('bookmarks.edit') : t('bookmarks.add')}
                          </h2>
                          <BookmarkForm
                            onSubmit={editingBookmark ? handleUpdate : addBookmark}
                            initialData={editingBookmark}
                            onCancel={editingBookmark ? () => setEditingBookmark(null) : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={user ? "lg:col-span-2" : "lg:col-span-3"}>
                    <Routes>
                      <Route 
                        path="/"
                        element={
                          <BookmarkList
                            bookmarks={bookmarks}
                            onEdit={handleEdit}
                            onDelete={deleteBookmark}
                            loading={loading}
                          />
                        }
                      />
                      <Route 
                        path="/tag/:tag"
                        element={
                          <BookmarkList
                            bookmarks={bookmarks}
                            onEdit={handleEdit}
                            onDelete={deleteBookmark}
                            loading={loading}
                          />
                        }
                      />
                      <Route 
                        path="/:lang/*"
                        element={
                          <BookmarkList
                            bookmarks={bookmarks}
                            onEdit={handleEdit}
                            onDelete={deleteBookmark}
                            loading={loading}
                          />
                        }
                      />
                    </Routes>
                  </div>

                  <div className="lg:col-span-1">
                    <PopularTags bookmarks={bookmarks} />
                  </div>
                </div>
              </div>

              <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                mode={authMode}
                onModeChange={setAuthMode}
              />
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;