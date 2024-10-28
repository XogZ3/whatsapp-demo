/* eslint-disable no-console */
import type { MetadataRoute } from 'next';

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
  'uses/imagine-me',
  'cancel-subscription',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = getBaseUrl();

  // Generate only canonical entries
  const entries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseURL}${page ? `/${page}` : ''}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: page === '' ? 1.0 : 0.8,
  }));

  return entries;
}
