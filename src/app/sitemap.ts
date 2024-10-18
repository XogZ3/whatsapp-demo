/* eslint-disable no-console */
import type { MetadataRoute } from 'next';

import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

export const pages = [
  '',
  'uses/ai-dating',
  'uses/professional-headshots',
  'uses/outfit-ideas',
  'uses/travel',
  'uses/instagram',
  'uses/hairstyles',
  'uses/linkedin-ai-photo',
  'uses/ai-headshot',
  'cancel-subscription',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = getBaseUrl();

  const sitemapEntries: MetadataRoute.Sitemap = AppConfig.locales.flatMap(
    (locale) => {
      const localePrefix =
        locale === AppConfig.defaultLocale ? '' : `/${locale}`;
      return pages.map((page) => ({
        url: `${baseURL}${localePrefix}${page ? `/${page}` : ''}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    },
  );

  return sitemapEntries;
}
