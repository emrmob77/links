import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, RefreshCw, Lock, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BookmarkFormData } from '../hooks/useBookmarks';
import { Button } from '@/components/ui/button';
import { Bookmark } from '../types';
import toast from 'react-hot-toast';

interface Props {
  onSubmit: (data: BookmarkFormData) => Promise<void>;
  initialData?: Bookmark | null;
  onCancel?: () => void;
}

export default function BookmarkForm({ onSubmit, initialData, onCancel }: Props) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [formData, setFormData] = useState<BookmarkFormData>({
    url: '',
    title: '',
    description: '',
    tags: [],
    is_public: true,
    language: i18n.language
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        url: initialData.url,
        title: initialData.title,
        description: initialData.description || '',
        tags: initialData.tags || [],
        is_public: initialData.is_public,
        language: initialData.language || i18n.language
      });
    }
  }, [initialData, i18n.language]);

  const fetchMetadata = async (url: string) => {
    setFetchingMetadata(true);
    try {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.status === 'success') {
        setFormData(prev => ({
          ...prev,
          title: data.data.title || prev.title,
          description: data.data.description || prev.description,
        }));
        toast.success(t('common.success'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        language: i18n.language
      });
      if (!initialData) {
        setFormData({ 
          url: '', 
          title: '', 
          description: '', 
          tags: [], 
          is_public: true,
          language: i18n.language
        });
        setTagInput('');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
    setLoading(false);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('bookmarks.url')}</label>
        <div className="mt-1 flex gap-2">
          <input
            type="url"
            value={formData.url}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, url: e.target.value }));
              if (e.target.value && !initialData) {
                fetchMetadata(e.target.value);
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://example.com"
            required
          />
          <Button
            type="button"
            onClick={() => formData.url && fetchMetadata(formData.url)}
            disabled={fetchingMetadata || !formData.url}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${fetchingMetadata ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('bookmarks.title')}</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('bookmarks.title')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('bookmarks.description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder={t('bookmarks.description')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('bookmarks.tags')}</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={t('bookmarks.addTag')}
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <Button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
          variant="ghost"
          className={`flex items-center gap-2 ${
            formData.is_public
              ? 'text-green-700 hover:text-green-800'
              : 'text-red-700 hover:text-red-800'
          }`}
        >
          {formData.is_public ? (
            <>
              <Unlock className="h-4 w-4" />
              {t('bookmarks.public')}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              {t('bookmarks.private')}
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            initialData ? t('bookmarks.save') : t('bookmarks.add')
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
          >
            {t('bookmarks.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}