import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { languages } from '../i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    // Get the current path without the language prefix
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '');
    
    // For English, use root path, for others use language prefix
    const newPath = lng === 'en' 
      ? `/${pathWithoutLang}`
      : `/${lng}${pathWithoutLang ? `/${pathWithoutLang}` : ''}`;
    
    // Clean up the path (remove double slashes and trailing slash)
    const cleanPath = newPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    
    // Only navigate if the path is different
    if (location.pathname !== cleanPath) {
      navigate(cleanPath + location.search + location.hash);
    }
  };

  return {
    currentLanguage: i18n.language,
    languages,
    changeLanguage
  };
}