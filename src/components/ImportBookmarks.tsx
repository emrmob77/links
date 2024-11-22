import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { useBookmarks } from '../hooks/useBookmarks';
import toast from 'react-hot-toast';

interface ChromeBookmark {
  date_added: string;
  id: string;
  name: string;
  type: string;
  url?: string;
  children?: ChromeBookmark[];
}

export default function ImportBookmarks() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addBookmark } = useBookmarks();

  const parseBookmarks = (bookmarks: ChromeBookmark[]) => {
    const result: { url: string; title: string; }[] = [];

    const traverse = (items: ChromeBookmark[]) => {
      for (const item of items) {
        if (item.type === 'url' && item.url) {
          result.push({
            url: item.url,
            title: item.name,
          });
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(bookmarks);
    return result;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.roots) {
        throw new Error('Invalid bookmark file format');
      }

      const bookmarks = parseBookmarks([
        data.roots.bookmark_bar,
        data.roots.other,
        data.roots.synced
      ].filter(Boolean));

      let imported = 0;
      let failed = 0;

      for (const bookmark of bookmarks) {
        try {
          await addBookmark({
            url: bookmark.url,
            title: bookmark.title,
            description: '',
            tags: [],
            is_public: false
          });
          imported++;
        } catch (error) {
          console.error('Error importing bookmark:', error);
          failed++;
        }
      }

      toast.success(
        t('bookmarks.importSuccess', {
          imported,
          failed: failed > 0 ? `, ${failed} ${t('bookmarks.importFailed')}` : ''
        })
      );
    } catch (error) {
      console.error('Error parsing bookmarks:', error);
      toast.error(t('bookmarks.importError'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {t('bookmarks.importFromChrome')}
      </Button>
    </>
  );
}