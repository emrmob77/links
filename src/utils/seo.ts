import slugify from 'slugify';
import i18n from 'i18next';

export function createSEFUrl(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: i18n.language
  });
}

export function getMetaTitle(tag: string): string {
  const decodedTag = decodeURIComponent(tag);
  return i18n.t('meta.tagTitle').replace('{tag}', decodedTag);
}

export function getMetaDescription(tag: string): string {
  const decodedTag = decodeURIComponent(tag);
  return i18n.t('meta.tagDescription').replace('{tag}', decodedTag);
}