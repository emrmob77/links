import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark } from '../types';
import { createSEFUrl } from '@/utils/seo';

interface Props {
  bookmarks: Bookmark[];
}

export default function PopularTags({ bookmarks }: Props) {
  const { t } = useTranslation();

  // Etiket frekanslarını hesapla
  const tagFrequency = bookmarks.reduce((acc, bookmark) => {
    bookmark.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // En popüler 10 etiketi al
  const popularTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t('tags.popular')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {popularTags.map(([tag, count]) => (
            <Link
              key={tag}
              to={`/tag/${createSEFUrl(tag)}`}
              className="group flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                <span className="group-hover:text-blue-600">{tag}</span>
              </div>
              <span className="text-xs text-gray-500">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}