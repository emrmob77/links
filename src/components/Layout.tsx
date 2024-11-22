import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { languages } from '../i18n';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  // Get language code from URL
  const urlLang = location.pathname.split('/')[1];

  React.useEffect(() => {
    // If URL language is valid and different from current
    if (urlLang && Object.keys(languages).includes(urlLang) && i18n.language !== urlLang) {
      // Update language
      i18n.changeLanguage(urlLang).then(() => {
        document.documentElement.lang = urlLang;
      });
    } else if (!urlLang && i18n.language !== 'en') {
      // If on root path, set language to English
      i18n.changeLanguage('en').then(() => {
        document.documentElement.lang = 'en';
      });
    }
  }, [urlLang, i18n]);

  React.useEffect(() => {
    // Only redirect non-English languages to their specific paths
    if (urlLang && !Object.keys(languages).includes(urlLang) && location.pathname !== '/') {
      // Use browser language or default to English
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const defaultLang = browserLang === 'en' ? '' : (Object.keys(languages).includes(browserLang) ? `/${browserLang}` : '');
      
      // Get current path (without leading /)
      const currentPath = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname;
      
      // Redirect to new URL
      navigate(`${defaultLang}/${currentPath}`, { replace: true });
    }
  }, [urlLang, location.pathname, navigate]);

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="twitter:title" content={t('meta.title')} />
        <meta property="twitter:description" content={t('meta.description')} />
        <link rel="canonical" href={`https://bookmarks.example.com${location.pathname}`} />
        <meta name="keywords" content={`bookmark manager, bookmarks, ${i18n.language} bookmarks, save websites, organize bookmarks, share bookmarks, bookmark collection, website organization, bookmark tags, multilingual bookmarks`} />
      </Helmet>
      <Outlet />
    </>
  );
}