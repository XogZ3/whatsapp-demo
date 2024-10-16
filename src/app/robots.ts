import type { MetadataRoute } from 'next';

import { getBaseUrl } from '@/utils/helpers';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  const isDomainFotolabs = baseUrl.includes('fotolabs.ai');

  return {
    rules: isDomainFotolabs
      ? {
          userAgent: '*',
          allow: '/',
          disallow: ['/api', '/dashboard', '/sign-in'],
        }
      : {
          userAgent: '*',
          disallow: '/',
        },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
