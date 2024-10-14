/* eslint-disable no-console */
import type { MetadataRoute } from 'next';

import { getBaseUrl } from '@/utils/helpers';

export const pages = [
  '',
  'ai-dating',
  'professional-headshots',
  'outfit-ideas',
  'travel',
  'instagram',
  'hairstyles',
  'cancel-subscription',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = getBaseUrl();
  const pagesSitemap: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseURL}/${page}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...pagesSitemap];
}
